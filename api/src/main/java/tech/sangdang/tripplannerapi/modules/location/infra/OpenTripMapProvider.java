package tech.sangdang.tripplannerapi.modules.location.infra;

import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import tech.sangdang.tripplannerapi.config.properties.OpenTripMapProperties;
import tech.sangdang.tripplannerapi.modules.location.domain.opentripmap.OpenTripMapSimpleFeature;
import tech.sangdang.tripplannerapi.modules.location.domain.port.LocationFetchPort;

@Slf4j
@Component
@RequiredArgsConstructor
public class OpenTripMapProvider implements LocationFetchPort {

  private static final String LANGUAGE = "en";

  private static final ParameterizedTypeReference<List<OpenTripMapSimpleFeature>>
      PLACES_RESPONSE_TYPE = new ParameterizedTypeReference<>() {};

  private final RestClient openTripMapRestClient;
  private final OpenTripMapProperties openTripMapProperties;

  @Override
  public List<OpenTripMapSimpleFeature> fetchLocationsByBoundingBox(
      double minLat, double maxLat, double minLng, double maxLng, int limit) {
    log.trace(
        "Calling OpenTripMap places/bbox with lang={}, minLat={}, maxLat={}, minLng={}, maxLng={}, limit={}",
        LANGUAGE,
        minLat,
        maxLat,
        minLng,
        maxLng,
        limit);
    log.info(
        "Fetching places from OpenTripMap for bounding box minLat={}, maxLat={}, minLng={}, maxLng={}",
        minLat,
        maxLat,
        minLng,
        maxLng);

    List<OpenTripMapSimpleFeature> places =
        openTripMapRestClient
            .get()
            .uri(
                uriBuilder ->
                    uriBuilder
                        .path("/{lang}/places/bbox")
                        .queryParam("lat_min", minLat)
                        .queryParam("lat_max", maxLat)
                        .queryParam("lon_min", minLng)
                        .queryParam("lon_max", maxLng)
                        .queryParam("format", "json")
                        .queryParam("limit", limit)
                        .queryParam("apikey", openTripMapProperties.apiKey())
                        .build(LANGUAGE))
            .retrieve()
            .body(PLACES_RESPONSE_TYPE);

    if (places == null) {
      log.warn(
          "OpenTripMap returned a null response body for bounding box minLat={}, maxLat={}, minLng={}, maxLng={}",
          minLat,
          maxLat,
          minLng,
          maxLng);
      return Collections.emptyList();
    }

    log.debug("OpenTripMap places/bbox returned {} place(s)", places.size());
    log.info("Successfully fetched {} place(s) from OpenTripMap", places.size());
    return places;
  }
}
