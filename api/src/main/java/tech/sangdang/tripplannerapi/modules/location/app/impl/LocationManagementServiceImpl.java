package tech.sangdang.tripplannerapi.modules.location.app.impl;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.openapitools.model.CreateManualLocationRequest;
import org.openapitools.model.LocationResponse;
import org.openapitools.model.PaginatedLocationsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import tech.sangdang.tripplannerapi.common.core.BadRequestException;
import tech.sangdang.tripplannerapi.common.core.NotFoundException;
import tech.sangdang.tripplannerapi.modules.location.app.LocationManagementService;
import tech.sangdang.tripplannerapi.modules.location.app.mapper.LocationMapper;
import tech.sangdang.tripplannerapi.modules.location.domain.CityEntity;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationEntity;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationSource;
import tech.sangdang.tripplannerapi.modules.location.domain.repository.CityRepository;
import tech.sangdang.tripplannerapi.modules.location.domain.repository.CountryRepository;
import tech.sangdang.tripplannerapi.modules.location.domain.repository.LocationRepository;

@Service
@RequiredArgsConstructor
public class LocationManagementServiceImpl implements LocationManagementService {
  private final LocationRepository locationRepository;
  private final CityRepository cityRepository;
  private final CountryRepository countryRepository;
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
    if (!countryRepository.existsById(request.getCountryId())) {
      throw new NotFoundException("Country not found");
    }

    CityEntity city =
        cityRepository
            .findById(request.getCityId())
            .orElseThrow(() -> new NotFoundException("City not found"));

    if (!city.getCountryId().equals(request.getCountryId())) {
      throw new BadRequestException("City is not in the specified country");
    }

    LocationEntity location =
        LocationEntity.builder()
            .name(request.getName())
            .cityId(request.getCityId())
            .countryId(request.getCountryId())
            .source(LocationSource.MANUAL)
            .addedBy(addedBy.toString())
            .images(locationMapper.toImageArray(request.getImages()))
            .build();

    return locationMapper.toResponse(locationRepository.save(location));
  }
}
