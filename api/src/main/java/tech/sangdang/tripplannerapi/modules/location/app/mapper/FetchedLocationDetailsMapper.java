package tech.sangdang.tripplannerapi.modules.location.app.mapper;

import java.util.Arrays;
import java.util.UUID;
import org.springframework.stereotype.Component;
import tech.sangdang.tripplannerapi.modules.location.domain.FetchedLocationDetails;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationDetailsEntity;

@Component
public class FetchedLocationDetailsMapper {

  public LocationDetailsEntity toEntity(FetchedLocationDetails details, UUID locationId) {
    return LocationDetailsEntity.builder()
        .id(locationId)
        .images(toImageArray(details.imageUrl()))
        .previewImages(toPreviewImageArray(details.previewImageUrl()))
        .kinds(parseKinds(details.kinds()))
        .description(details.description())
        .popularity(details.popularity())
        .source(LocationDetailsEntity.DEFAULT_SOURCE)
        .build();
  }

  private String[] toImageArray(String imageUrl) {
    if (imageUrl == null || imageUrl.isBlank()) {
      return new String[0];
    }

    return new String[] {imageUrl};
  }

  private String[] toPreviewImageArray(String previewImageUrl) {
    if (previewImageUrl == null || previewImageUrl.isBlank()) {
      return new String[0];
    }

    return new String[] {previewImageUrl};
  }

  private String[] parseKinds(String kinds) {
    if (kinds == null || kinds.isBlank()) {
      return new String[0];
    }

    return Arrays.stream(kinds.split(","))
        .map(String::trim)
        .filter(kind -> !kind.isEmpty())
        .toArray(String[]::new);
  }
}
