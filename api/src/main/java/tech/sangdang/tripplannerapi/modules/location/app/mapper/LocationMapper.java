package tech.sangdang.tripplannerapi.modules.location.app.mapper;

import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;
import org.openapitools.model.LocationResponse;
import org.springframework.stereotype.Component;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationEntity;

@Component
public class LocationMapper {

  public LocationResponse toResponse(LocationEntity location) {
    return LocationResponse.builder()
        .id(location.getId())
        .name(location.getName())
        .cityId(location.getCityId())
        .countryId(location.getCountryId())
        .cityDisplayName(location.getCityDisplayName())
        .countryDisplayName(location.getCountryDisplayName())
        .source(LocationResponse.SourceEnum.fromValue(location.getSource().name()))
        .googleMapsId(location.getGoogleMapsId())
        .addedBy(location.getAddedBy())
        .images(toImageList(location.getImages()))
        .createdAt(location.getCreatedDate().atOffset(ZoneOffset.UTC))
        .updatedAt(location.getLastModifiedDate().atOffset(ZoneOffset.UTC))
        .build();
  }

  public String[] toImageArray(List<String> images) {
    if (images == null || images.isEmpty()) {
      return new String[0];
    }
    return images.toArray(String[]::new);
  }

  private List<String> toImageList(String[] images) {
    return images == null ? List.of() : Arrays.asList(images);
  }
}
