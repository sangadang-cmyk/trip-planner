package tech.sangdang.tripplannerapi.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import tech.sangdang.tripplannerapi.config.properties.NominatimProperties;

@Configuration
@EnableConfigurationProperties(NominatimProperties.class)
public class NominatimConfig {

  @Bean
  RestClient nominatimRestClient(NominatimProperties properties) {
    return RestClient.builder()
        .baseUrl(properties.baseUrl())
        .defaultHeader("User-Agent", properties.userAgent())
        .requestFactory(
            new BufferingClientHttpRequestFactory(new SimpleClientHttpRequestFactory()))
        .requestInterceptor(new RestClientLoggingInterceptor("Nominatim"))
        .build();
  }
}
