package tech.sangdang.tripplannerapi.modules.location.app;

import java.util.List;
import org.openapitools.model.GeolocationSearchResult;

public interface GeolocationSearchService {
  List<GeolocationSearchResult> search(String query);
}
