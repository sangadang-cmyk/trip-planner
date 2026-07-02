package tech.sangdang.tripplannerapi.modules.trip.domain.repository;

import java.util.UUID;

public interface TripDestinationThumbnailSource {
  UUID getTripId();

  UUID getLocationId();
}
