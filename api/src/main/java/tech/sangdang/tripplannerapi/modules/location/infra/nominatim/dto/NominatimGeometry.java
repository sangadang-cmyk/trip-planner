package tech.sangdang.tripplannerapi.modules.location.infra.nominatim.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NominatimGeometry(@JsonProperty("coordinates") List<Double> coordinates) {}
