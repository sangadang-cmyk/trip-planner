package tech.sangdang.tripplannerapi.modules.location.api;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.openapitools.api.LocationsApi;
import org.openapitools.model.BoundingBoxRequest;
import org.openapitools.model.LocationDetailsResponse;
import org.openapitools.model.LocationResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import tech.sangdang.tripplannerapi.modules.location.app.LocationDetailsService;
import tech.sangdang.tripplannerapi.modules.location.app.LocationService;

@RestController
@RequiredArgsConstructor
public class LocationController implements LocationsApi {
  private final LocationService locationService;
  private final LocationDetailsService locationDetailsService;

  @Override
  public ResponseEntity<List<LocationResponse>> userLocationsBoundingBoxPost(
      BoundingBoxRequest boundingBoxRequest) {
    return ResponseEntity.ok(
        locationService.fetchLocationsInBoundingBox(boundingBoxRequest));
  }

  @Override
  public ResponseEntity<LocationDetailsResponse> userLocationsDetailsIdGet(UUID id) {
    return ResponseEntity.ok(locationDetailsService.getLocationDetailsById(id));
  }

  @Override
  public ResponseEntity<LocationResponse> userLocationsIdGet(UUID id) {
    return ResponseEntity.ok(locationService.getLocationById(id));
  }
}
