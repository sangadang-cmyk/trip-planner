package tech.sangdang.tripplannerapi.modules.location.app.impl;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openapitools.model.BoundingBoxRequest;
import org.openapitools.model.LocationResponse;
import org.springframework.stereotype.Service;
import tech.sangdang.tripplannerapi.modules.location.app.LocationManagementService;
import tech.sangdang.tripplannerapi.modules.location.app.LocationService;
import tech.sangdang.tripplannerapi.modules.location.app.mapper.LocationMapper;
import tech.sangdang.tripplannerapi.modules.location.domain.OpenTripMapRequestEntity;
import tech.sangdang.tripplannerapi.modules.location.domain.exception.LocationFetchException;
import tech.sangdang.tripplannerapi.modules.location.domain.opentripmap.OpenTripMapSimpleFeature;
import tech.sangdang.tripplannerapi.modules.location.domain.port.LocationFetchPort;
import tech.sangdang.tripplannerapi.modules.location.domain.repository.LocationRepository;
import tech.sangdang.tripplannerapi.modules.location.domain.repository.OpenTripMapRequestRepository;
import tech.sangdang.tripplannerapi.modules.location.infra.opentripmap.OpenTripMapResponseMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {

  public static final int BOUNDING_BOX_LOCATION_LIMIT = 20;

  private final LocationRepository locationRepository;
  private final OpenTripMapRequestRepository openTripMapRequestRepository;
  private final LocationFetchPort locationFetchPort;
  private final OpenTripMapResponseMapper openTripMapResponseMapper;
  private final LocationManagementService locationManagementService;
  private final LocationMapper locationMapper;

  @Override
  public LocationResponse getLocationById(UUID id) {
    return locationManagementService.getLocationById(id);
  }

  @Override
  public List<LocationResponse> fetchLocationsInBoundingBox(BoundingBoxRequest boundingBoxRequest) {
    log.trace(
        "fetchLocationsInBoundingBox called with minLat={}, maxLat={}, minLng={}, maxLng={}",
        boundingBoxRequest.getMinLat(),
        boundingBoxRequest.getMaxLat(),
        boundingBoxRequest.getMinLng(),
        boundingBoxRequest.getMaxLng());

    List<LocationResponse> locations =
        locationRepository
            .findByBoundingBox(
                boundingBoxRequest.getMinLat(),
                boundingBoxRequest.getMaxLat(),
                boundingBoxRequest.getMinLng(),
                boundingBoxRequest.getMaxLng(),
                BOUNDING_BOX_LOCATION_LIMIT)
            .stream()
            .map(locationMapper::toResponse)
            .toList();

    log.debug("Database lookup returned {} locations for bounding box", locations.size());

    if (!locations.isEmpty()) {
      log.info("Returning {} locations from database cache", locations.size());
      return locations;
    }

    log.debug("No database locations found, checking overlapping OpenTripMap request cache");

    List<OpenTripMapRequestEntity> overlappingRequests =
        openTripMapRequestRepository.findByOverlappingBoundingBox(
            boundingBoxRequest.getMinLat(),
            boundingBoxRequest.getMaxLat(),
            boundingBoxRequest.getMinLng(),
            boundingBoxRequest.getMaxLng());

    log.debug("Found {} overlapping OpenTripMap request(s)", overlappingRequests.size());

    if (!overlappingRequests.isEmpty()) {
      OpenTripMapRequestEntity cachedRequest = overlappingRequests.getFirst();
      log.info(
          "Resolving locations from cached OpenTripMap request id={}",
          cachedRequest.getId());
      return resolveFromCachedOpenTripMapRequest(cachedRequest);
    }

    log.info("No overlapping OpenTripMap cache found, calling OpenTripMap API");

    try {
      List<OpenTripMapSimpleFeature> places =
          locationFetchPort.fetchLocationsByBoundingBox(
              boundingBoxRequest.getMinLat(),
              boundingBoxRequest.getMaxLat(),
              boundingBoxRequest.getMinLng(),
              boundingBoxRequest.getMaxLng(),
              BOUNDING_BOX_LOCATION_LIMIT);

      log.debug("OpenTripMap API returned {} place(s)", places.size());

      saveOpenTripMapRequest(boundingBoxRequest, openTripMapResponseMapper.toJson(places));

      if (places.isEmpty()) {
        log.info("OpenTripMap returned no places for bounding box; treating area as empty");
        return List.of();
      }

      locationManagementService.cacheOpenTripMapLocations(places);
      log.info(
          "Returning {} locations from OpenTripMap and queued async database cache",
          places.size());
      return places.stream().map(locationMapper::fromOpenTripMapFeature).toList();
    } catch (Exception ex) {
      log.warn(
          "Failed to fetch locations from OpenTripMap for bounding box minLat={}, maxLat={}, minLng={}, maxLng={}",
          boundingBoxRequest.getMinLat(),
          boundingBoxRequest.getMaxLat(),
          boundingBoxRequest.getMinLng(),
          boundingBoxRequest.getMaxLng(),
          ex);
      throw new LocationFetchException("Failed to fetch locations from OpenTripMap", ex);
    }
  }

  private List<LocationResponse> resolveFromCachedOpenTripMapRequest(
      OpenTripMapRequestEntity cachedRequest) {
    log.trace("Parsing cached OpenTripMap response for request id={}", cachedRequest.getId());

    String response = cachedRequest.getResponse();
    if (response == null || response.isBlank()) {
      log.warn(
          "Cached OpenTripMap request id={} has no response body; treating area as empty",
          cachedRequest.getId());
      return List.of();
    }

    List<OpenTripMapSimpleFeature> cachedPlaces = openTripMapResponseMapper.fromJson(response);
    log.debug(
        "Cached OpenTripMap request id={} contains {} place(s)",
        cachedRequest.getId(),
        cachedPlaces.size());

    if (cachedPlaces.isEmpty()) {
      log.info(
          "Cached OpenTripMap request id={} confirmed empty area",
          cachedRequest.getId());
      return List.of();
    }

    locationManagementService.cacheOpenTripMapLocations(cachedPlaces);
    log.info(
        "Returning {} locations from cached OpenTripMap request id={}",
        cachedPlaces.size(),
        cachedRequest.getId());
    return cachedPlaces.stream().map(locationMapper::fromOpenTripMapFeature).toList();
  }

  private void saveOpenTripMapRequest(BoundingBoxRequest boundingBoxRequest, String response) {
    log.trace(
        "Saving OpenTripMap request for bounding box minLat={}, maxLat={}, minLng={}, maxLng={}",
        boundingBoxRequest.getMinLat(),
        boundingBoxRequest.getMaxLat(),
        boundingBoxRequest.getMinLng(),
        boundingBoxRequest.getMaxLng());

    OpenTripMapRequestEntity savedRequest =
        openTripMapRequestRepository.save(
            OpenTripMapRequestEntity.builder()
                .minLat(boundingBoxRequest.getMinLat())
                .maxLat(boundingBoxRequest.getMaxLat())
                .minLng(boundingBoxRequest.getMinLng())
                .maxLng(boundingBoxRequest.getMaxLng())
                .response(response)
                .build());

    log.debug("Saved OpenTripMap request id={}", savedRequest.getId());
  }
}
