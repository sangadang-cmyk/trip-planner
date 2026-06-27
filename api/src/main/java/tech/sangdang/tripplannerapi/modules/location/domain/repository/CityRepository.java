package tech.sangdang.tripplannerapi.modules.location.domain.repository;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tech.sangdang.tripplannerapi.modules.location.domain.CityEntity;

@Repository
public interface CityRepository extends JpaRepository<CityEntity, UUID> {
  Page<CityEntity> findByCountryId(UUID countryId, Pageable pageable);
}
