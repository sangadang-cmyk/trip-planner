package tech.sangdang.tripplannerapi.modules.location.api;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.openapitools.api.GeolocationApi;
import org.openapitools.model.GeolocationSearchResult;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import tech.sangdang.tripplannerapi.modules.location.app.GeolocationSearchService;

@RestController
@RequiredArgsConstructor
public class GeolocationSearchController implements GeolocationApi {
  private static final MediaType GEO_JSON_MEDIA_TYPE =
      MediaType.parseMediaType("application/geo+json");

  private final GeolocationSearchService geolocationSearchService;

  @Override
  public ResponseEntity<List<GeolocationSearchResult>> geolocationSearchGet(String q) {
    return ResponseEntity.ok(geolocationSearchService.search(q));
  }

  @Override
  public ResponseEntity<String> geolocationPolygonGet(Long osmId) {
    String polygonGeoJson = geolocationSearchService.getPolygonGeoJson(osmId);
    return ResponseEntity.ok().contentType(GEO_JSON_MEDIA_TYPE).body(polygonGeoJson);
  }
}
