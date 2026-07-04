package tech.sangdang.tripplannerapi.modules.location.infra.nominatim;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import tech.sangdang.tripplannerapi.modules.location.domain.GeolocationSearchResult;
import tech.sangdang.tripplannerapi.modules.location.domain.port.GeolocationSearchPort;
import tech.sangdang.tripplannerapi.modules.location.infra.nominatim.dto.NominatimFeatureCollection;

@Slf4j
@Component
@RequiredArgsConstructor
public class NominatimProvider implements GeolocationSearchPort {
  private final RestClient nominatimRestClient;
  private final NominatimResponseMapper nominatimResponseMapper;

  @Override
  public List<GeolocationSearchResult> searchCountriesAndCities(String query) {
    log.info("Searching Nominatim for countries and cities with query={}", query);

    NominatimFeatureCollection response =
        nominatimRestClient
            .get()
            .uri(
                uriBuilder ->
                    uriBuilder
                        .path("/search")
                        .queryParam("q", query)
                        .queryParam("format", "geojson")
                        .queryParam("featureType", "country+city")
                        .build())
            .retrieve()
            .body(NominatimFeatureCollection.class);

    if (response == null) {
      log.warn("Nominatim returned a null response body for query={}", query);
      return List.of();
    }

    List<GeolocationSearchResult> results = nominatimResponseMapper.toSearchResults(response);
    log.debug("Nominatim search returned {} country/city result(s) for query={}", results.size(), query);
    return results;
  }
}
