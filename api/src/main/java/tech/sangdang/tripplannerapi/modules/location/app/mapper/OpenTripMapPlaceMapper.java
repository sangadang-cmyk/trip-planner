package tech.sangdang.tripplannerapi.modules.location.app.mapper;

import java.util.Arrays;
import java.util.UUID;
import org.springframework.stereotype.Component;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationDetailsEntity;
import tech.sangdang.tripplannerapi.modules.location.domain.opentripmap.OpenTripMapPlace;
import tech.sangdang.tripplannerapi.modules.location.domain.opentripmap.OpenTripMapPreview;

@Component
public class OpenTripMapPlaceMapper {

  public LocationDetailsEntity toEntity(OpenTripMapPlace place, UUID locationId) {
    return LocationDetailsEntity.builder()
        .id(locationId)
        .images(toImageArray(place.image()))
        .previewImages(toPreviewImageArray(place.preview()))
        .kinds(parseKinds(place.kinds()))
        .description(resolveDescription(place))
        .popularity(mapRateToPopularity(place.rate()))
        .source(LocationDetailsEntity.DEFAULT_SOURCE)
        .build();
  }

  private String[] toImageArray(String image) {
    if (image == null || image.isBlank()) {
      return new String[0];
    }
    return new String[] {ImageUrlParser.parseImageUrl(image)};
  }

  private String[] toPreviewImageArray(OpenTripMapPreview preview) {
    if (preview == null || preview.source() == null || preview.source().isBlank()) {
      return new String[0];
    }
    return new String[] {ImageUrlParser.parseImageUrl(preview.source())};
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

  private String resolveDescription(OpenTripMapPlace place) {
    if (place.wikipediaExtracts() != null
        && place.wikipediaExtracts().text() != null
        && !place.wikipediaExtracts().text().isBlank()) {
      return place.wikipediaExtracts().text();
    }

    if (place.info() != null
        && place.info().descr() != null
        && !place.info().descr().isBlank()) {
      return place.info().descr();
    }

    return "";
  }

  private int mapRateToPopularity(String rate) {
    if (rate == null) {
      return 0;
    }

    return switch (rate) {
      case "1" -> 1;
      case "2" -> 2;
      case "3" -> 3;
      case "1h" -> 4;
      case "2h" -> 5;
      case "3h" -> 6;
      default -> 0;
    };
  }
}
