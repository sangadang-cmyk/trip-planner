package tech.sangdang.tripplannerapi.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.nominatim")
public record NominatimProperties(String baseUrl, String userAgent) {
  public NominatimProperties {
    if (baseUrl == null || baseUrl.isBlank()) {
      baseUrl = "https://nominatim.openstreetmap.org";
    }
    if (userAgent == null || userAgent.isBlank()) {
      userAgent = "TripPlanner/1.0";
    }
  }
}
