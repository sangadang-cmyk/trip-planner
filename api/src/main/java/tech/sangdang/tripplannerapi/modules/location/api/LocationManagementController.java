package tech.sangdang.tripplannerapi.modules.location.api;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.openapitools.api.LocationManagementApi;
import org.openapitools.model.CreateManualLocationRequest;
import org.openapitools.model.LocationResponse;
import org.openapitools.model.PaginatedLocationsResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RestController;
import tech.sangdang.tripplannerapi.modules.account.infra.AccountUserDetails;
import tech.sangdang.tripplannerapi.modules.location.app.LocationManagementService;

@RestController
@RequiredArgsConstructor
public class LocationManagementController implements LocationManagementApi {
  private final LocationManagementService locationManagementService;

  @Override
  public ResponseEntity<PaginatedLocationsResponse> adminLocationsGet(Integer page, Integer size) {
    PaginatedLocationsResponse response = locationManagementService.getLocations(page, size);
    return ResponseEntity.ok(response);
  }

  @Override
  public ResponseEntity<LocationResponse> adminLocationsIdGet(UUID id) {
    LocationResponse response = locationManagementService.getLocationById(id);
    return ResponseEntity.ok(response);
  }

  @Override
  public ResponseEntity<LocationResponse> adminLocationsManualPost(
      CreateManualLocationRequest createManualLocationRequest) {
    AccountUserDetails userDetails =
        (AccountUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    LocationResponse response =
        locationManagementService.createManualLocation(
            createManualLocationRequest, userDetails.getAccount().getId());
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }
}
