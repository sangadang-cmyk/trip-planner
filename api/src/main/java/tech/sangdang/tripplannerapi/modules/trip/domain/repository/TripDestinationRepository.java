package tech.sangdang.tripplannerapi.modules.trip.domain.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.sangdang.tripplannerapi.modules.trip.domain.TripDestinationEntity;

@Repository
public interface TripDestinationRepository
    extends JpaRepository<TripDestinationEntity, UUID> {
  @Query(
      """
      SELECT td FROM TripDestinationEntity td
      WHERE td.trip.id = :tripId AND td.deletedDate IS NULL
      ORDER BY CASE WHEN td.dayNumber = -1 THEN 1 ELSE 0 END, td.dayNumber ASC, td.sortOrder ASC
      """)
  List<TripDestinationEntity> findActiveByTripIdOrdered(@Param("tripId") UUID tripId);

  Optional<TripDestinationEntity> findByIdAndTrip_IdAndDeletedDateIsNull(UUID id, UUID tripId);

  Optional<TripDestinationEntity> findByTrip_IdAndLocation_Id(UUID tripId, UUID locationId);

  @Query(
      """
      SELECT td.trip.id AS tripId, td.location.id AS locationId
      FROM TripDestinationEntity td
      WHERE td.trip.id IN :tripIds AND td.deletedDate IS NULL
      ORDER BY td.trip.id, CASE WHEN td.dayNumber = -1 THEN 1 ELSE 0 END, td.dayNumber ASC, td.sortOrder ASC
      """)
  List<TripDestinationThumbnailSource> findThumbnailSourcesByTripIdIn(
      @Param("tripIds") Collection<UUID> tripIds);
}
