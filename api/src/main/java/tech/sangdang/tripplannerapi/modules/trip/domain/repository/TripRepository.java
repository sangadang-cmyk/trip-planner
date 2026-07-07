package tech.sangdang.tripplannerapi.modules.trip.domain.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tech.sangdang.tripplannerapi.modules.trip.domain.TripEntity;

@Repository
public interface TripRepository extends JpaRepository<TripEntity, UUID> {
  List<TripEntity> findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID userId);

  Optional<TripEntity> findByIdAndUserIdAndDeletedAtIsNull(UUID id, UUID userId);
}
