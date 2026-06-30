package tech.sangdang.tripplannerapi.modules.location.app;

import java.util.List;
import java.util.UUID;
import org.openapitools.model.CreateManualLocationRequest;
import org.openapitools.model.LocationResponse;
import org.openapitools.model.PaginatedLocationsResponse;
import tech.sangdang.tripplannerapi.modules.location.domain.opentripmap.OpenTripMapSimpleFeature;

public interface LocationManagementService {
  PaginatedLocationsResponse getLocations(int page, int size);

  LocationResponse getLocationById(UUID id);

  LocationResponse createManualLocation(CreateManualLocationRequest request, UUID addedBy);

  void cacheOpenTripMapLocations(List<OpenTripMapSimpleFeature> places);
}
