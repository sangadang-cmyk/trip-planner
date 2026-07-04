package tech.sangdang.tripplannerapi.modules.location.infra.nominatim.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NominatimFeature(NominatimProperties properties) {}
