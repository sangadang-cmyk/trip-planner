package tech.sangdang.tripplannerapi.modules.location.infra.opentripmap;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import tech.sangdang.tripplannerapi.config.properties.OpenTripMapProperties;
import tech.sangdang.tripplannerapi.modules.location.domain.FetchedLocationDetails;
import tech.sangdang.tripplannerapi.modules.location.domain.FetchedLocationSummary;
import tech.sangdang.tripplannerapi.modules.location.domain.port.LocationFetchPort;
import tech.sangdang.tripplannerapi.modules.location.infra.opentripmap.dto.OpenTripMapPlace;
import tech.sangdang.tripplannerapi.modules.location.infra.opentripmap.dto.OpenTripMapSimpleFeature;

@Slf4j
@Component
@RequiredArgsConstructor
public class OpenTripMapProvider implements LocationFetchPort {

  private static final String LANGUAGE = "en";

  private static final ParameterizedTypeReference<List<OpenTripMapSimpleFeature>>
      PLACES_RESPONSE_TYPE = new ParameterizedTypeReference<>() {};

  private final RestClient openTripMapRestClient;
  private final OpenTripMapProperties openTripMapProperties;
  private final OpenTripMapLocationMapper openTripMapLocationMapper;

  @Override
  public List<FetchedLocationSummary> fetchLocationsByBoundingBox(
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
                        .queryParam("rate", 2)
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
    return places.stream().map(openTripMapLocationMapper::toSummary).toList();
  }

  @Override
  public Optional<FetchedLocationDetails> fetchLocationDetailsBySourceId(String sourceId) {
    log.trace("Calling OpenTripMap places/xid with lang={}, xid={}", LANGUAGE, sourceId);
    log.info("Fetching place details from OpenTripMap for xid={}", sourceId);

    Optional<OpenTripMapPlace> place =
        openTripMapRestClient
            .get()
            .uri(
                uriBuilder ->
                    uriBuilder
                        .path("/{lang}/places/xid/{xid}")
                        .queryParam("apikey", openTripMapProperties.apiKey())
                        .build(LANGUAGE, sourceId))
            .exchange(
                (request, response) -> {
                  if (response.getStatusCode().value() == 404) {
                    log.info("OpenTripMap place not found for xid={}", sourceId);
                    return Optional.empty();
                  }

                  if (response.getStatusCode().isError()) {
                    throw new IllegalStateException(
                        "OpenTripMap place details request failed with status "
                            + response.getStatusCode().value());
                  }

                  return Optional.ofNullable(response.bodyTo(OpenTripMapPlace.class));
                });

    if (place.isEmpty()) {
      log.warn("OpenTripMap returned no place details for xid={}", sourceId);
      return Optional.empty();
    }

    log.info("Successfully fetched place details from OpenTripMap for xid={}", sourceId);
    return place.map(openTripMapLocationMapper::toDetails);
  }
}
