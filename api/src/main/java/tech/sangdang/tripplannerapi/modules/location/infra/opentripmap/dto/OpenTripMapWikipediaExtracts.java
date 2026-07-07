package tech.sangdang.tripplannerapi.modules.location.infra.opentripmap.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenTripMapWikipediaExtracts(
    @JsonProperty("title") String title,
    @JsonProperty("text") String text,
    @JsonProperty("html") String html) {}
