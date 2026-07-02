package tech.sangdang.tripplannerapi.modules.location.app.mapper;

import java.util.Arrays;
import java.util.List;
import org.openapitools.model.LocationDetailsResponse;
import org.springframework.stereotype.Component;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationDetailsEntity;

@Component
public class LocationDetailsMapper {

  public LocationDetailsResponse toResponse(LocationDetailsEntity details) {
    return LocationDetailsResponse.builder()
        .id(details.getId())
        .images(toList(details.getImages()))
        .previewImages(toList(details.getPreviewImages()))
        .kinds(toList(details.getKinds()))
        .description(details.getDescription())
        .popularity(details.getPopularity())
        .country(details.getCountry())
        .state(details.getState())
        .source(details.getSource())
        .build();
  }

  private List<String> toList(String[] values) {
    return values == null ? List.of() : Arrays.asList(values);
  }
}
