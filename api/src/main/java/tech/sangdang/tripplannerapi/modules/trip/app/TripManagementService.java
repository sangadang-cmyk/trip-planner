package tech.sangdang.tripplannerapi.modules.trip.app;

import java.util.List;
import java.util.UUID;
import org.openapitools.model.CreateTripDestinationRequest;
import org.openapitools.model.CreateTripRequest;
import org.openapitools.model.TripDestinationResponse;
import org.openapitools.model.TripResponse;
import org.openapitools.model.UpdateTripDestinationRequest;
import org.openapitools.model.UpdateTripRequest;

public interface TripManagementService {
  List<TripResponse> getTrips(UUID userId);

  TripResponse getTripById(UUID tripId, UUID userId);

  TripResponse updateTrip(UUID tripId, UpdateTripRequest request, UUID userId);

  List<TripDestinationResponse> getTripDestinations(UUID tripId, UUID userId);

  TripDestinationResponse createTripDestination(
      UUID tripId, CreateTripDestinationRequest request, UUID userId);

  TripDestinationResponse updateTripDestination(
      UUID tripId, UUID destinationId, UpdateTripDestinationRequest request, UUID userId);

  void deleteTripDestination(UUID tripId, UUID destinationId, UUID userId);

  TripResponse createTrip(CreateTripRequest request, UUID userId);
}
