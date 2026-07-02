package tech.sangdang.tripplannerapi.modules.location.app;

import java.util.List;
import java.util.UUID;
import org.openapitools.model.BoundingBoxRequest;
import org.openapitools.model.LocationResponse;

public interface LocationService {
  List<LocationResponse> fetchLocationsInBoundingBox(BoundingBoxRequest boundingBoxRequest);

  LocationResponse getLocationById(UUID id);
}
