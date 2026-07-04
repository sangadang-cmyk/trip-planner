package tech.sangdang.tripplannerapi.modules.location.infra.nominatim.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NominatimFeatureCollection(List<NominatimFeature> features) {}
