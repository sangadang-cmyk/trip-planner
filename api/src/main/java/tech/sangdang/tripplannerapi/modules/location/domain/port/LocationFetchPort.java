package tech.sangdang.tripplannerapi.modules.location.domain.port;

import java.util.List;
import java.util.Optional;
import tech.sangdang.tripplannerapi.modules.location.domain.FetchedLocationDetails;
import tech.sangdang.tripplannerapi.modules.location.domain.FetchedLocationSummary;

public interface LocationFetchPort {
  List<FetchedLocationSummary> fetchLocationsByBoundingBox(
      double minLat, double maxLat, double minLng, double maxLng, int limit);

  Optional<FetchedLocationDetails> fetchLocationDetailsBySourceId(String sourceId);
}
