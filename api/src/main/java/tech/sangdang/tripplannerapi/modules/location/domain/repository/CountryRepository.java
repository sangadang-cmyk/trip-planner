package tech.sangdang.tripplannerapi.modules.location.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tech.sangdang.tripplannerapi.modules.location.domain.CountryEntity;

public interface CountryRepository extends JpaRepository<CountryEntity, Long> {}
