package tech.sangdang.tripplannerapi.modules.location.infra.opentripmap;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tech.sangdang.tripplannerapi.modules.location.domain.FetchedLocationSummary;
import tech.sangdang.tripplannerapi.modules.location.infra.opentripmap.dto.OpenTripMapSimpleFeature;

@Component
@RequiredArgsConstructor
public class OpenTripMapResponseMapper {

  private static final TypeReference<List<OpenTripMapSimpleFeature>> PLACES_RESPONSE_TYPE =
      new TypeReference<>() {};

  private static final TypeReference<List<FetchedLocationSummary>> SUMMARIES_RESPONSE_TYPE =
      new TypeReference<>() {};

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final OpenTripMapLocationMapper openTripMapLocationMapper;

  public List<OpenTripMapSimpleFeature> fromOpenTripMapJson(String response) {
    try {
      return objectMapper.readValue(response, PLACES_RESPONSE_TYPE);
    } catch (Exception ex) {
      throw new IllegalArgumentException("Failed to parse OpenTripMap places response", ex);
    }
  }

  public List<FetchedLocationSummary> fromCachedJson(String response) {
    try {
      return objectMapper.readValue(response, SUMMARIES_RESPONSE_TYPE);
    } catch (Exception ex) {
      List<OpenTripMapSimpleFeature> legacyPlaces = fromOpenTripMapJson(response);
      return legacyPlaces.stream().map(openTripMapLocationMapper::toSummary).toList();
    }
  }

  public String toJson(List<FetchedLocationSummary> locations) {
    try {
      return objectMapper.writeValueAsString(locations);
    } catch (Exception ex) {
      throw new IllegalArgumentException("Failed to serialize cached location summaries", ex);
    }
  }
}
