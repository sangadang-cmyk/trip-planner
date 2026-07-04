package tech.sangdang.tripplannerapi.modules.location.infra.nominatim.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NominatimProperties(
    @JsonProperty("place_id") Long placeId,
    @JsonProperty("osm_type") String osmType,
    @JsonProperty("osm_id") Long osmId,
    @JsonProperty("name") String name,
    @JsonProperty("addresstype") String addressType) {}
