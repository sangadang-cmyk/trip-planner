package tech.sangdang.tripplannerapi.config;

import com.nimbusds.jose.util.Base64;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

@Configuration
public class JwtConfig {
  @Bean
  JwtEncoder jwtEncoder(@Value("${app.security.jwt.secret}") String secret) {
    SecretKey secretKey = secretKey(secret);
    return NimbusJwtEncoder.withSecretKey(secretKey).algorithm(MacAlgorithm.HS256).build();
  }

  @Bean
  JwtDecoder jwtDecoder(@Value("${app.security.jwt.secret}") String secret) {
    SecretKey secretKey = secretKey(secret);
    return NimbusJwtDecoder.withSecretKey(secretKey).macAlgorithm(MacAlgorithm.HS256).build();
  }

  private SecretKey secretKey(String secret) {
    byte[] secretBytes = Base64.from(secret).decode();
    return new SecretKeySpec(secretBytes, "HmacSHA256");
  }
}
