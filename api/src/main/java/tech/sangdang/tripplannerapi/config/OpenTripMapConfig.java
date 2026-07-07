package tech.sangdang.tripplannerapi.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import tech.sangdang.tripplannerapi.config.properties.OpenTripMapProperties;

@Configuration
@EnableConfigurationProperties(OpenTripMapProperties.class)
public class OpenTripMapConfig {

  @Bean
  RestClient openTripMapRestClient(OpenTripMapProperties properties) {
    return RestClient.builder()
        .baseUrl(properties.baseUrl())
        .requestFactory(
            new BufferingClientHttpRequestFactory(new SimpleClientHttpRequestFactory()))
        .requestInterceptor(new RestClientLoggingInterceptor("OpenTripMap"))
        .build();
  }
}
