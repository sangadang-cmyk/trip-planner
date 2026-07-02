package tech.sangdang.tripplannerapi.modules.location.domain.opentripmap;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenTripMapPreview(
    @JsonProperty("source") String source,
    @JsonProperty("width") Integer width,
    @JsonProperty("height") Integer height) {}
