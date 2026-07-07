package tech.sangdang.tripplannerapi.modules.location.domain.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationDetailsEntity;

@Repository
public interface LocationDetailsRepository extends JpaRepository<LocationDetailsEntity, UUID> {}
