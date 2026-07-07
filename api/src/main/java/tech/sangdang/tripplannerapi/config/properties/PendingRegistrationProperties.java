package tech.sangdang.tripplannerapi.config.properties;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.auth.pending-registration")
public record PendingRegistrationProperties(
    Duration expiration,
    String cleanupCron,
    Duration resendAllowedBeforeExpiry,
    Duration resendGraceAfterExpiry) {

  public PendingRegistrationProperties {
    if (resendAllowedBeforeExpiry == null) {
      resendAllowedBeforeExpiry = Duration.ofSeconds(10);
    }
    if (resendGraceAfterExpiry == null) {
      resendGraceAfterExpiry = Duration.ofMinutes(10);
    }
  }
}
