package tech.sangdang.tripplannerapi.modules.location.app;

import java.util.UUID;
import org.openapitools.model.LocationDetailsResponse;

public interface LocationDetailsService {
  LocationDetailsResponse getLocationDetailsById(UUID id);
}
