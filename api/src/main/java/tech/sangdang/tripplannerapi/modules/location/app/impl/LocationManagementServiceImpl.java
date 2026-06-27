package tech.sangdang.tripplannerapi.modules.location.app.impl;

import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.openapitools.model.CreateManualLocationRequest;
import org.openapitools.model.LocationResponse;
import org.springframework.stereotype.Service;
import tech.sangdang.tripplannerapi.common.core.BadRequestException;
import tech.sangdang.tripplannerapi.common.core.NotFoundException;
import tech.sangdang.tripplannerapi.modules.location.app.LocationManagementService;
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
            .images(toImageArray(request.getImages()))
            .build();

    return toLocationResponse(locationRepository.save(location));
  }

  private LocationResponse toLocationResponse(LocationEntity location) {
    return LocationResponse.builder()
        .id(location.getId())
        .name(location.getName())
        .cityId(location.getCityId())
        .countryId(location.getCountryId())
        .source(LocationResponse.SourceEnum.fromValue(location.getSource().name()))
        .googleMapsId(location.getGoogleMapsId())
        .addedBy(location.getAddedBy())
        .images(toImageList(location.getImages()))
        .createdAt(location.getCreatedDate().atOffset(ZoneOffset.UTC))
        .updatedAt(location.getLastModifiedDate().atOffset(ZoneOffset.UTC))
        .build();
  }

  private List<String> toImageList(String[] images) {
    return images == null ? List.of() : Arrays.asList(images);
  }

  private String[] toImageArray(List<String> images) {
    if (images == null || images.isEmpty()) {
      return new String[0];
    }
    return images.toArray(String[]::new);
  }
}
