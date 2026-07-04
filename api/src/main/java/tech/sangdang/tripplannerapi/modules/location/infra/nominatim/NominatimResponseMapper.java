package tech.sangdang.tripplannerapi.modules.location.infra.nominatim;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import org.springframework.stereotype.Component;
import tech.sangdang.tripplannerapi.modules.location.domain.GeolocationSearchResult;
import tech.sangdang.tripplannerapi.modules.location.infra.nominatim.dto.NominatimFeatureCollection;

@Component
public class NominatimResponseMapper {
  private static final Set<String> SUPPORTED_ADDRESS_TYPES = Set.of("country", "city");

  public List<GeolocationSearchResult> toSearchResults(NominatimFeatureCollection response) {
    if (response.features() == null) {
      return List.of();
    }

    return response.features().stream()
        .map(feature -> feature.properties())
        .filter(Objects::nonNull)
        .filter(
            properties ->
                properties.addressType() != null
                    && SUPPORTED_ADDRESS_TYPES.contains(properties.addressType()))
        .filter(properties -> properties.name() != null && !properties.name().isBlank())
        .map(
            properties ->
                new GeolocationSearchResult(properties.name(), properties.addressType()))
        .toList();
  }
}
