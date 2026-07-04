package tech.sangdang.tripplannerapi.modules.location.app.mapper;

import org.openapitools.model.GeolocationSearchResult;
import org.springframework.stereotype.Component;

@Component
public class GeolocationSearchMapper {

  public GeolocationSearchResult toResponse(
      tech.sangdang.tripplannerapi.modules.location.domain.GeolocationSearchResult result) {
    return GeolocationSearchResult.builder()
        .osmId(result.osmId())
        .name(result.name())
        .addressType(
            GeolocationSearchResult.AddressTypeEnum.fromValue(result.addressType()))
        .latitude(result.latitude())
        .longitude(result.longitude())
        .build();
  }
}
