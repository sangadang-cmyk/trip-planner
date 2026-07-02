package tech.sangdang.tripplannerapi.modules.location.app.impl;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openapitools.model.LocationDetailsResponse;
import org.springframework.stereotype.Service;
import tech.sangdang.tripplannerapi.common.core.NotFoundException;
import tech.sangdang.tripplannerapi.modules.location.app.LocationDetailsService;
import tech.sangdang.tripplannerapi.modules.location.app.mapper.LocationDetailsMapper;
import tech.sangdang.tripplannerapi.modules.location.app.mapper.OpenTripMapPlaceMapper;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationDetailsEntity;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationEntity;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationSource;
import tech.sangdang.tripplannerapi.modules.location.domain.exception.LocationFetchException;
import tech.sangdang.tripplannerapi.modules.location.domain.opentripmap.OpenTripMapPlace;
import tech.sangdang.tripplannerapi.modules.location.domain.port.LocationFetchPort;
import tech.sangdang.tripplannerapi.modules.location.domain.repository.LocationDetailsRepository;
import tech.sangdang.tripplannerapi.modules.location.domain.repository.LocationRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationDetailsServiceImpl implements LocationDetailsService {
  private final LocationRepository locationRepository;
  private final LocationDetailsRepository locationDetailsRepository;
  private final LocationFetchPort locationFetchPort;
  private final LocationDetailsMapper locationDetailsMapper;
  private final OpenTripMapPlaceMapper openTripMapPlaceMapper;

  @Override
  public LocationDetailsResponse getLocationDetailsById(UUID id) {
    log.trace("getLocationDetailsById called with id={}", id);

    LocationEntity location =
        locationRepository
            .findById(id)
            .orElseThrow(() -> new NotFoundException("Location not found"));

    return locationDetailsRepository
        .findById(id)
        .map(
            cachedDetails -> {
              log.info("Returning cached location details for location id={}", id);
              return locationDetailsMapper.toResponse(cachedDetails);
            })
        .orElseGet(() -> fetchAndCacheLocationDetails(location));
  }

  private LocationDetailsResponse fetchAndCacheLocationDetails(LocationEntity location) {
    if (location.getSource() != LocationSource.OPENTRIPMAPS) {
      log.info(
          "Location id={} has unsupported source={} for details lookup",
          location.getId(),
          location.getSource());
      throw new NotFoundException("Location details not found");
    }

    String sourceId = location.getSourceId();
    if (sourceId == null || sourceId.isBlank()) {
      log.warn("Location id={} is missing OpenTripMap source id", location.getId());
      throw new NotFoundException("Location details not found");
    }

    log.info(
        "Fetching OpenTripMap details for location id={} with sourceId={}",
        location.getId(),
        sourceId);

    try {
      OpenTripMapPlace place =
          locationFetchPort
              .fetchPlaceByXid(sourceId)
              .orElseThrow(() -> new NotFoundException("Location details not found"));

      LocationDetailsEntity details =
          locationDetailsRepository.save(
              openTripMapPlaceMapper.toEntity(place, location.getId()));

      log.info("Cached location details for location id={}", location.getId());
      return locationDetailsMapper.toResponse(details);
    } catch (NotFoundException ex) {
      throw ex;
    } catch (Exception ex) {
      log.warn(
          "Failed to fetch location details from OpenTripMap for location id={} and sourceId={}",
          location.getId(),
          sourceId,
          ex);
      throw new LocationFetchException("Failed to fetch location details from OpenTripMap", ex);
    }
  }
}
