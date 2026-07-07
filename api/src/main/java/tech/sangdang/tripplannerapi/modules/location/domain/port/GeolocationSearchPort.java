package tech.sangdang.tripplannerapi.modules.location.domain.port;

import java.util.List;
import tech.sangdang.tripplannerapi.modules.location.domain.GeolocationSearchResult;

public interface GeolocationSearchPort {
  List<GeolocationSearchResult> searchCountriesAndCities(String query);
}
