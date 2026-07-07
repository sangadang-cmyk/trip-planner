package tech.sangdang.tripplannerapi.modules.location.domain.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.sangdang.tripplannerapi.modules.location.domain.OpenTripMapRequestEntity;

@Repository
public interface OpenTripMapRequestRepository
    extends JpaRepository<OpenTripMapRequestEntity, UUID> {

  // TODO: Learn how this works and update
  @Query(value = """
      SELECT *
      FROM open_trip_map_requests
      WHERE :minLat <= max_lat
        AND :maxLat >= min_lat
        AND :minLng <= max_lng
        AND :maxLng >= min_lng
        AND (
          (LEAST(:maxLat, max_lat) - GREATEST(:minLat, min_lat))
          * (LEAST(:maxLng, max_lng) - GREATEST(:minLng, min_lng))
        ) / NULLIF(
          ((:maxLat - :minLat) * (:maxLng - :minLng))
          + ((max_lat - min_lat) * (max_lng - min_lng))
          - (
            (LEAST(:maxLat, max_lat) - GREATEST(:minLat, min_lat))
            * (LEAST(:maxLng, max_lng) - GREATEST(:minLng, min_lng))
          ),
          0
        ) >= 0.7
      ORDER BY created_at DESC
      """, nativeQuery = true)
  List<OpenTripMapRequestEntity> findByOverlappingBoundingBox(
      @Param("minLat") double minLat,
      @Param("maxLat") double maxLat,
      @Param("minLng") double minLng,
      @Param("maxLng") double maxLng);
}
