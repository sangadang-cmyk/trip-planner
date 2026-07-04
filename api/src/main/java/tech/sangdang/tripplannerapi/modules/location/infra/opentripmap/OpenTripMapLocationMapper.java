package tech.sangdang.tripplannerapi.modules.location.infra.opentripmap;

import org.springframework.stereotype.Component;
import tech.sangdang.tripplannerapi.modules.location.domain.FetchedLocationDetails;
import tech.sangdang.tripplannerapi.modules.location.domain.FetchedLocationSummary;
import tech.sangdang.tripplannerapi.modules.location.infra.opentripmap.dto.OpenTripMapPlace;
import tech.sangdang.tripplannerapi.modules.location.infra.opentripmap.dto.OpenTripMapPreview;
import tech.sangdang.tripplannerapi.modules.location.infra.opentripmap.dto.OpenTripMapSimpleFeature;

@Component
public class OpenTripMapLocationMapper {

  public FetchedLocationSummary toSummary(OpenTripMapSimpleFeature place) {
    return new FetchedLocationSummary(
        place.xid(),
        place.name(),
        place.point() != null ? place.point().lat() : null,
        place.point() != null ? place.point().lon() : null);
  }

  public FetchedLocationDetails toDetails(OpenTripMapPlace place) {
    return new FetchedLocationDetails(
        parseImageUrl(place.image()),
        parsePreviewImageUrl(place.preview()),
        place.kinds(),
        resolveDescription(place),
        mapRateToPopularity(place.rate()));
  }

  private String parseImageUrl(String image) {
    if (image == null || image.isBlank()) {
      return null;
    }

    return ImageUrlParser.parseImageUrl(image);
  }

  private String parsePreviewImageUrl(OpenTripMapPreview preview) {
    if (preview == null || preview.source() == null || preview.source().isBlank()) {
      return null;
    }

    return ImageUrlParser.parseImageUrl(preview.source());
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
