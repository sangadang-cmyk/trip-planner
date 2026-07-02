package tech.sangdang.tripplannerapi.modules.location.domain.port;

import java.util.List;
import java.util.Optional;
import tech.sangdang.tripplannerapi.modules.location.domain.opentripmap.OpenTripMapPlace;
import tech.sangdang.tripplannerapi.modules.location.domain.opentripmap.OpenTripMapSimpleFeature;

public interface LocationFetchPort {
  List<OpenTripMapSimpleFeature> fetchLocationsByBoundingBox(
      double minLat, double maxLat, double minLng, double maxLng, int limit);

  Optional<OpenTripMapPlace> fetchPlaceByXid(String xid);
}
