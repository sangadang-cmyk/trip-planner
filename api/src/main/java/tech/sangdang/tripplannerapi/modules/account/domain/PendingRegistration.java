package tech.sangdang.tripplannerapi.modules.account.domain;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PendingRegistration {
  private final String email;
  private final String name;
  private final String hashedPassword;
  private final Role role;
  private final String verificationCode;
  private final String challenge;
  private final LocalDateTime createdAt;
  private final LocalDateTime expiresAt;

  public boolean isExpired(LocalDateTime at) {
    return !at.isBefore(expiresAt);
  }
}
