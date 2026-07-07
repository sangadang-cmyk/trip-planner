package tech.sangdang.tripplannerapi.modules.location.app.mapper;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.openapitools.model.LocationResponse;
import org.springframework.stereotype.Component;
import tech.sangdang.tripplannerapi.modules.location.domain.FetchedLocationSummary;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationEntity;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationSource;

@Component
public class LocationMapper {

  public LocationResponse toResponse(LocationEntity location) {
    return LocationResponse.builder()
        .id(location.getId())
        .name(location.getName())
        .latitude(location.getLatitude())
        .longitude(location.getLongitude())
        .popularity(location.getPopularity())
        .source(LocationResponse.SourceEnum.fromValue(location.getSource().name()))
        .googleMapsId(location.getSourceId())
        .addedBy(location.getAddedBy())
        .createdAt(location.getCreatedDate().atOffset(ZoneOffset.UTC))
        .updatedAt(location.getLastModifiedDate().atOffset(ZoneOffset.UTC))
        .build();
  }

  public LocationResponse fromFetchedLocationSummary(FetchedLocationSummary place) {
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    return LocationResponse.builder()
        .name(place.name())
        .latitude(place.latitude())
        .longitude(place.longitude())
        .popularity(0)
        .source(LocationResponse.SourceEnum.fromValue(LocationSource.OPENTRIPMAPS.name()))
        .googleMapsId(place.sourceId())
        .createdAt(now)
        .updatedAt(now)
        .build();
  }
}
