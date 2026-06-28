package tech.sangdang.tripplannerapi.modules.trip.domain.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tech.sangdang.tripplannerapi.modules.trip.domain.TripDestinationEntity;

@Repository
public interface TripDestinationRepository
    extends JpaRepository<TripDestinationEntity, UUID> {
  List<TripDestinationEntity> findByTrip_IdAndDeletedDateIsNullOrderByDayNumberAscSortOrderAsc(
      UUID tripId);

  Optional<TripDestinationEntity> findByIdAndTrip_IdAndDeletedDateIsNull(UUID id, UUID tripId);

  Optional<TripDestinationEntity> findByTrip_IdAndLocation_Id(UUID tripId, UUID locationId);
}
