package tech.sangdang.tripplannerapi.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.opentripmap")
public record OpenTripMapProperties(String apiKey, String baseUrl) {
  public OpenTripMapProperties {
    if (baseUrl == null || baseUrl.isBlank()) {
      baseUrl = "https://api.opentripmap.com/0.1";
    }
  }
}
