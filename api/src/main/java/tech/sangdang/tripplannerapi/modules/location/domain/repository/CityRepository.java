package tech.sangdang.tripplannerapi.modules.location.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tech.sangdang.tripplannerapi.modules.location.domain.CityEntity;

public interface CityRepository extends JpaRepository<CityEntity, Long> {}
