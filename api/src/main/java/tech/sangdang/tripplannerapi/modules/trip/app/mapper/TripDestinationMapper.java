package tech.sangdang.tripplannerapi.modules.trip.app.mapper;

import java.time.ZoneOffset;
import org.openapitools.model.TripDestinationResponse;
import org.springframework.stereotype.Component;
import tech.sangdang.tripplannerapi.modules.trip.domain.TripDestinationEntity;

@Component
public class TripDestinationMapper {

  public TripDestinationResponse toResponse(TripDestinationEntity destination) {
    return TripDestinationResponse.builder()
        .id(destination.getId())
        .tripId(destination.getTrip().getId())
        .locationId(destination.getLocation().getId())
        .dayNumber(destination.getDayNumber())
        .sortOrder(destination.getSortOrder())
        .notes(destination.getNotes())
        .createdAt(destination.getCreatedAt().atOffset(ZoneOffset.UTC))
        .updatedAt(destination.getUpdatedAt().atOffset(ZoneOffset.UTC))
        .build();
  }
}
