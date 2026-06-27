package tech.sangdang.tripplannerapi.modules.location.app;

import java.util.UUID;
import org.openapitools.model.CreateManualLocationRequest;
import org.openapitools.model.LocationResponse;

public interface LocationManagementService {
  LocationResponse createManualLocation(CreateManualLocationRequest request, UUID addedBy);
}
