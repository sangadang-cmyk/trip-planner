package tech.sangdang.tripplannerapi.modules.location.infra.nominatim;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
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

    List<GeolocationSearchResult> cityResults = searchByFeatureType(query, "city");
    List<GeolocationSearchResult> countryResults = searchByFeatureType(query, "country");
    List<GeolocationSearchResult> combinedResults = combineResults(cityResults, countryResults);

    log.debug(
        "Nominatim search returned {} city and {} country result(s), {} combined for query={}",
        cityResults.size(),
        countryResults.size(),
        combinedResults.size(),
        query);
    return combinedResults;
  }

  private List<GeolocationSearchResult> searchByFeatureType(String query, String featureType) {
    log.trace("Calling Nominatim search with query={} and featureType={}", query, featureType);

    NominatimFeatureCollection response =
        nominatimRestClient
            .get()
            .uri(
                uriBuilder ->
                    uriBuilder
                        .path("/search")
                        .queryParam("q", query)
                        .queryParam("format", "geojson")
                        .queryParam("featureType", featureType)
                        .build())
            .retrieve()
            .body(NominatimFeatureCollection.class);

    if (response == null) {
      log.warn(
          "Nominatim returned a null response body for query={} and featureType={}",
          query,
          featureType);
      return List.of();
    }

    return nominatimResponseMapper.toSearchResults(response);
  }

  private List<GeolocationSearchResult> combineResults(
      List<GeolocationSearchResult> cityResults, List<GeolocationSearchResult> countryResults) {
    Set<String> seen = new LinkedHashSet<>();
    List<GeolocationSearchResult> combined = new ArrayList<>();

    for (GeolocationSearchResult result : cityResults) {
      if (seen.add(resultKey(result))) {
        combined.add(result);
      }
    }

    for (GeolocationSearchResult result : countryResults) {
      if (seen.add(resultKey(result))) {
        combined.add(result);
      }
    }

    return combined;
  }

  private String resultKey(GeolocationSearchResult result) {
    return result.addressType() + '|' + result.id();
  }
}
