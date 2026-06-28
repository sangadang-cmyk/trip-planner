package tech.sangdang.tripplannerapi.modules.trip.app.mapper;

import java.time.ZoneOffset;
import org.openapitools.model.TripResponse;
import org.springframework.stereotype.Component;
import tech.sangdang.tripplannerapi.modules.trip.domain.TripEntity;

@Component
public class TripMapper {

  public TripResponse toResponse(TripEntity trip) {
    return TripResponse.builder()
        .id(trip.getId())
        .userId(trip.getUserId())
        .name(trip.getName())
        .startDate(trip.getStartDate())
        .endDate(trip.getEndDate())
        .notes(trip.getNotes())
        .createdAt(trip.getCreatedAt().atOffset(ZoneOffset.UTC))
        .updatedAt(trip.getUpdatedAt().atOffset(ZoneOffset.UTC))
        .build();
  }
}
