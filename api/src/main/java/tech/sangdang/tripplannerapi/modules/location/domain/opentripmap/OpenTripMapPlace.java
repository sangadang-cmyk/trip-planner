package tech.sangdang.tripplannerapi.modules.location.domain.opentripmap;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenTripMapPlace(
    @JsonProperty("xid") String xid,
    @JsonProperty("name") String name,
    @JsonProperty("kinds") String kinds,
    @JsonProperty("rate") String rate,
    @JsonProperty("image") String image,
    @JsonProperty("preview") OpenTripMapPreview preview,
    @JsonProperty("wikipedia_extracts") OpenTripMapWikipediaExtracts wikipediaExtracts,
    @JsonProperty("info") OpenTripMapPlaceInfo info) {}
