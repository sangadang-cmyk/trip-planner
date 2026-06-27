package tech.sangdang.tripplannerapi.modules.location.domain.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationEntity;

@Repository
public interface LocationRepository extends JpaRepository<LocationEntity, UUID> {}
