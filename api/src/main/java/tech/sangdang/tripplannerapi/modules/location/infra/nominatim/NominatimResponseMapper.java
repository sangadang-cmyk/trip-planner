package tech.sangdang.tripplannerapi.modules.location.infra.nominatim;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import org.springframework.stereotype.Component;
import tech.sangdang.tripplannerapi.modules.location.domain.GeolocationSearchResult;
import tech.sangdang.tripplannerapi.modules.location.infra.nominatim.dto.NominatimFeature;
import tech.sangdang.tripplannerapi.modules.location.infra.nominatim.dto.NominatimFeatureCollection;

@Component
public class NominatimResponseMapper {
  private static final Set<String> SUPPORTED_ADDRESS_TYPES = Set.of("country", "city");

  public List<GeolocationSearchResult> toSearchResults(NominatimFeatureCollection response) {
    if (response.features() == null) {
      return List.of();
    }

    return response.features().stream()
        .map(this::mapFeature)
        .filter(Objects::nonNull)
        .filter(
            result ->
                result.addressType() != null
                    && SUPPORTED_ADDRESS_TYPES.contains(result.addressType()))
        .filter(result -> result.id() != null)
        .filter(result -> result.name() != null && !result.name().isBlank())
        .toList();
  }

  private GeolocationSearchResult mapFeature(NominatimFeature feature) {
    var properties = feature.properties();
    if (properties == null || properties.placeId() == null) {
      return null;
    }

    Double latitude = null;
    Double longitude = null;
    if (feature.geometry() != null && feature.geometry().coordinates() != null) {
      List<Double> coordinates = feature.geometry().coordinates();
      if (coordinates.size() >= 2) {
        longitude = coordinates.get(0);
        latitude = coordinates.get(1);
      }
    }

    return new GeolocationSearchResult(
        properties.placeId(),
        properties.name(),
        properties.addressType(),
        latitude,
        longitude);
  }
}
