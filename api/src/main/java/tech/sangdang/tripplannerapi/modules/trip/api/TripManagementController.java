package tech.sangdang.tripplannerapi.modules.trip.api;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.openapitools.api.TripManagementApi;
import org.openapitools.model.CreateTripDestinationRequest;
import org.openapitools.model.CreateTripRequest;
import org.openapitools.model.TripDestinationResponse;
import org.openapitools.model.TripResponse;
import org.openapitools.model.UpdateTripDestinationRequest;
import org.openapitools.model.UpdateTripRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RestController;
import tech.sangdang.tripplannerapi.modules.account.infra.AccountUserDetails;
import tech.sangdang.tripplannerapi.modules.trip.app.TripManagementService;

@RestController
@RequiredArgsConstructor
public class TripManagementController implements TripManagementApi {
  private final TripManagementService tripManagementService;

  @Override
  public ResponseEntity<List<TripResponse>> userTripsGet() {
    AccountUserDetails userDetails = currentUser();
    return ResponseEntity.ok(tripManagementService.getTrips(userDetails.getAccount().getId()));
  }

  @Override
  public ResponseEntity<TripResponse> userTripsIdGet(UUID id) {
    AccountUserDetails userDetails = currentUser();
    return ResponseEntity.ok(
        tripManagementService.getTripById(id, userDetails.getAccount().getId()));
  }

  @Override
  public ResponseEntity<TripResponse> userTripsIdPut(UUID id, UpdateTripRequest updateTripRequest) {
    AccountUserDetails userDetails = currentUser();
    return ResponseEntity.ok(
        tripManagementService.updateTrip(id, updateTripRequest, userDetails.getAccount().getId()));
  }

  @Override
  public ResponseEntity<List<TripDestinationResponse>> userTripsTripIdDestinationsGet(
      UUID tripId) {
    AccountUserDetails userDetails = currentUser();
    return ResponseEntity.ok(
        tripManagementService.getTripDestinations(tripId, userDetails.getAccount().getId()));
  }

  @Override
  public ResponseEntity<TripDestinationResponse> userTripsTripIdDestinationsPost(
      UUID tripId, CreateTripDestinationRequest createTripDestinationRequest) {
    AccountUserDetails userDetails = currentUser();
    TripDestinationResponse response =
        tripManagementService.createTripDestination(
            tripId, createTripDestinationRequest, userDetails.getAccount().getId());
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @Override
  public ResponseEntity<TripDestinationResponse> userTripsTripIdDestinationsDestinationIdPut(
      UUID tripId, UUID destinationId, UpdateTripDestinationRequest updateTripDestinationRequest) {
    AccountUserDetails userDetails = currentUser();
    return ResponseEntity.ok(
        tripManagementService.updateTripDestination(
            tripId,
            destinationId,
            updateTripDestinationRequest,
            userDetails.getAccount().getId()));
  }

  @Override
  public ResponseEntity<Void> userTripsTripIdDestinationsDestinationIdDelete(
      UUID tripId, UUID destinationId) {
    AccountUserDetails userDetails = currentUser();
    tripManagementService.deleteTripDestination(
        tripId, destinationId, userDetails.getAccount().getId());
    return ResponseEntity.noContent().build();
  }

  @Override
  public ResponseEntity<TripResponse> userTripsPost(CreateTripRequest createTripRequest) {
    AccountUserDetails userDetails = currentUser();
    TripResponse response =
        tripManagementService.createTrip(createTripRequest, userDetails.getAccount().getId());
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  private AccountUserDetails currentUser() {
    return (AccountUserDetails)
        SecurityContextHolder.getContext().getAuthentication().getPrincipal();
  }
}
