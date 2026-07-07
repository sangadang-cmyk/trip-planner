package tech.sangdang.tripplannerapi.modules.location.domain.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationEntity;

@Repository
public interface LocationRepository extends JpaRepository<LocationEntity, UUID> {

  boolean existsBySourceId(String sourceId);

  @Query(
      value =
          """
          SELECT *
          FROM locations
          WHERE latitude IS NOT NULL
            AND longitude IS NOT NULL
            AND latitude BETWEEN :minLat AND :maxLat
            AND longitude BETWEEN :minLng AND :maxLng
          ORDER BY popularity DESC
          LIMIT :limit
          """,
      nativeQuery = true)
  List<LocationEntity> findByBoundingBox(
      @Param("minLat") double minLat,
      @Param("maxLat") double maxLat,
      @Param("minLng") double minLng,
      @Param("maxLng") double maxLng,
      @Param("limit") int limit);
}
