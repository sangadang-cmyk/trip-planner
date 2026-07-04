package tech.sangdang.tripplannerapi.modules.location.api;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.openapitools.api.GeolocationApi;
import org.openapitools.model.GeolocationSearchResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import tech.sangdang.tripplannerapi.modules.location.app.GeolocationSearchService;

@RestController
@RequiredArgsConstructor
public class GeolocationSearchController implements GeolocationApi {
  private final GeolocationSearchService geolocationSearchService;

  @Override
  public ResponseEntity<List<GeolocationSearchResult>> geolocationSearchGet(String q) {
    return ResponseEntity.ok(geolocationSearchService.search(q));
  }
}
