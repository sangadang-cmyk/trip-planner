package tech.sangdang.tripplannerapi.modules.location.infra.opentripmap;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tech.sangdang.tripplannerapi.modules.location.domain.opentripmap.OpenTripMapSimpleFeature;

@Component
@RequiredArgsConstructor
public class OpenTripMapResponseMapper {

  private static final TypeReference<List<OpenTripMapSimpleFeature>> PLACES_RESPONSE_TYPE =
      new TypeReference<>() {};

  private final ObjectMapper objectMapper = new ObjectMapper();

  public List<OpenTripMapSimpleFeature> fromJson(String response) {
    try {
      return objectMapper.readValue(response, PLACES_RESPONSE_TYPE);
    } catch (Exception ex) {
      throw new IllegalArgumentException("Failed to parse OpenTripMap places response", ex);
    }
  }

  public String toJson(List<OpenTripMapSimpleFeature> places) {
    try {
      return objectMapper.writeValueAsString(places);
    } catch (Exception ex) {
      throw new IllegalArgumentException("Failed to serialize OpenTripMap places response", ex);
    }
  }
}
