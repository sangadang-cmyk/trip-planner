package tech.sangdang.tripplannerapi.modules.location.app.impl;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.openapitools.model.CreateManualLocationRequest;
import org.openapitools.model.LocationResponse;
import org.openapitools.model.PaginatedLocationsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import tech.sangdang.tripplannerapi.common.core.NotFoundException;
import tech.sangdang.tripplannerapi.modules.location.app.LocationManagementService;
import tech.sangdang.tripplannerapi.modules.location.app.mapper.LocationMapper;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationEntity;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationSource;
import tech.sangdang.tripplannerapi.modules.location.domain.opentripmap.OpenTripMapSimpleFeature;
import tech.sangdang.tripplannerapi.modules.location.domain.repository.LocationRepository;

@Service
@RequiredArgsConstructor
public class LocationManagementServiceImpl implements LocationManagementService {
  private final LocationRepository locationRepository;
  private final LocationMapper locationMapper;

  @Override
  public PaginatedLocationsResponse getLocations(int page, int size) {
    Page<LocationEntity> locationPage =
        locationRepository.findAll(PageRequest.of(page, size));

    return PaginatedLocationsResponse.builder()
        .content(locationPage.getContent().stream().map(locationMapper::toResponse).toList())
        .page(locationPage.getNumber())
        .size(locationPage.getSize())
        .totalElements(locationPage.getTotalElements())
        .totalPages(locationPage.getTotalPages())
        .build();
  }

  @Override
  public LocationResponse getLocationById(UUID id) {
    LocationEntity location =
        locationRepository
            .findById(id)
            .orElseThrow(() -> new NotFoundException("Location not found"));
    return locationMapper.toResponse(location);
  }

  @Override
  public LocationResponse createManualLocation(CreateManualLocationRequest request, UUID addedBy) {
    LocationEntity location =
        LocationEntity.builder()
            .name(request.getName())
            .latitude(request.getLatitude())
            .longitude(request.getLongitude())
            .popularity(Optional.ofNullable(request.getPopularity()).orElse(0))
            .source(LocationSource.MANUAL)
            .addedBy(addedBy.toString())
            .build();

    return locationMapper.toResponse(locationRepository.save(location));
  }

  @Async
  @Override
  public void cacheOpenTripMapLocations(List<OpenTripMapSimpleFeature> places) {
    for (OpenTripMapSimpleFeature place : places) {
      if (locationRepository.existsBySourceId(place.xid())) {
        continue;
      }
      locationRepository.save(toEntity(place));
    }
  }

  private LocationEntity toEntity(OpenTripMapSimpleFeature place) {
    return LocationEntity.builder()
        .name(place.name())
        .latitude(place.point() != null ? place.point().lat() : null)
        .longitude(place.point() != null ? place.point().lon() : null)
        .popularity(0)
        .source(LocationSource.OPENTRIPMAPS)
        .sourceId(place.xid())
        .build();
  }
}
