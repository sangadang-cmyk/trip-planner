package tech.sangdang.tripplannerapi.modules.location.app;

import java.util.List;
import org.openapitools.model.BoundingBoxRequest;
import org.openapitools.model.LocationResponse;

public interface LocationService {
  List<LocationResponse> fetchLocationsInBoundingBox(BoundingBoxRequest boundingBoxRequest);
}
