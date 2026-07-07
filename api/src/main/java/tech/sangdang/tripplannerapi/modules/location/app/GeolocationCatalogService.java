package tech.sangdang.tripplannerapi.modules.location.app;

import java.util.List;
import tech.sangdang.tripplannerapi.modules.location.domain.GeolocationSearchResult;

public interface GeolocationCatalogService {
  void cacheSearchResults(List<GeolocationSearchResult> results);
}
