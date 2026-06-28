package tech.sangdang.tripplannerapi.modules.location.app;

import java.util.UUID;
import org.openapitools.model.CreateManualLocationRequest;
import org.openapitools.model.LocationResponse;
import org.openapitools.model.PaginatedLocationsResponse;

public interface LocationManagementService {
  PaginatedLocationsResponse getLocations(int page, int size);

  LocationResponse getLocationById(UUID id);

  LocationResponse createManualLocation(CreateManualLocationRequest request, UUID addedBy);
}
