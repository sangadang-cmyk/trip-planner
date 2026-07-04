package tech.sangdang.tripplannerapi.modules.location.domain.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import tech.sangdang.tripplannerapi.modules.location.domain.CityEntity;

public interface CityRepository extends JpaRepository<CityEntity, Long> {
  Optional<CityEntity> findByOsmId(Long osmId);
}
