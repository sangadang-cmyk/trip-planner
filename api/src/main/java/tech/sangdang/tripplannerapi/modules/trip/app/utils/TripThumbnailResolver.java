package tech.sangdang.tripplannerapi.modules.trip.app.utils;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationDetailsEntity;
import tech.sangdang.tripplannerapi.modules.location.domain.repository.LocationDetailsRepository;
import tech.sangdang.tripplannerapi.modules.trip.domain.repository.TripDestinationRepository;
import tech.sangdang.tripplannerapi.modules.trip.domain.repository.TripDestinationThumbnailSource;

@Component
@RequiredArgsConstructor
public class TripThumbnailResolver {
  private final TripDestinationRepository tripDestinationRepository;
  private final LocationDetailsRepository locationDetailsRepository;

  public Map<UUID, String> resolveThumbnailsByTripId(Collection<UUID> tripIds) {
    if (tripIds.isEmpty()) {
      return Map.of();
    }

    List<TripDestinationThumbnailSource> sources =
        tripDestinationRepository.findThumbnailSourcesByTripIdIn(tripIds);

    if (sources.isEmpty()) {
      return Map.of();
    }

    Set<UUID> locationIds = new HashSet<>();
    for (TripDestinationThumbnailSource source : sources) {
      locationIds.add(source.getLocationId());
    }

    Map<UUID, LocationDetailsEntity> detailsByLocationId = new HashMap<>();
    for (LocationDetailsEntity details : locationDetailsRepository.findAllById(locationIds)) {
      detailsByLocationId.put(details.getId(), details);
    }

    Map<UUID, String> thumbnailsByTripId = new HashMap<>();
    for (TripDestinationThumbnailSource source : sources) {
      if (thumbnailsByTripId.containsKey(source.getTripId())) {
        continue;
      }

      String thumbnail = extractThumbnail(detailsByLocationId.get(source.getLocationId()));
      if (thumbnail != null) {
        thumbnailsByTripId.put(source.getTripId(), thumbnail);
      }
    }

    return thumbnailsByTripId;
  }

  private String extractThumbnail(LocationDetailsEntity details) {
    if (details == null) {
      return null;
    }

    String image = firstNonBlank(details.getImages());
    if (image != null) {
      return image;
    }

    return firstNonBlank(details.getPreviewImages());
  }

  private String firstNonBlank(String[] values) {
    if (values == null) {
      return null;
    }

    for (String value : values) {
      if (value != null && !value.isBlank()) {
        return value;
      }
    }

    return null;
  }
}
