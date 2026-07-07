package tech.sangdang.tripplannerapi.modules.account.support;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;
import org.openapitools.model.LoginRequest;
import org.openapitools.model.RegisterRequest;
import org.openapitools.model.ResendVerificationRequest;
import org.openapitools.model.VerifyEmailRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import tech.sangdang.tripplannerapi.config.properties.PendingRegistrationProperties;
import tech.sangdang.tripplannerapi.modules.account.domain.AccountEntity;
import tech.sangdang.tripplannerapi.modules.account.domain.PendingRegistration;
import tech.sangdang.tripplannerapi.modules.account.domain.Role;

public final class AuthenticationTestFixtures {
  public static final String EMAIL = "danganhsang09@gmail.com";
  public static final String NORMALIZED_EMAIL = EMAIL.trim().toLowerCase();
  public static final String PASSWORD = "123123123";
  public static final String NAME = "Test User";
  public static final String CHALLENGE = "7f3c9a2e1b4d6f8a0c2e4b6d8f0a1c3e";
  public static final String VERIFICATION_CODE = "ABC12";
  public static final String ACCESS_TOKEN = "test-access-token";

  private static final PasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();

  private AuthenticationTestFixtures() {}

  public static PendingRegistrationProperties pendingRegistrationProperties() {
    return new PendingRegistrationProperties(
        Duration.ofMinutes(30),
        "0 0 */12 * * *",
        Duration.ofSeconds(10),
        Duration.ofMinutes(10));
  }

  public static RegisterRequest registerRequest() {
    return RegisterRequest.builder().email(EMAIL).password(PASSWORD).name(NAME).build();
  }

  public static LoginRequest loginRequest() {
    return LoginRequest.builder().email(EMAIL).password(PASSWORD).build();
  }

  public static VerifyEmailRequest verifyEmailRequest() {
    return VerifyEmailRequest.builder()
        .email(EMAIL)
        .challenge(CHALLENGE)
        .verificationCode(VERIFICATION_CODE)
        .build();
  }

  public static ResendVerificationRequest resendVerificationRequest() {
    return ResendVerificationRequest.builder().email(EMAIL).challenge(CHALLENGE).build();
  }

  public static PendingRegistration pendingRegistration(LocalDateTime expiresAt) {
    LocalDateTime createdAt = expiresAt.minusMinutes(30);
    return PendingRegistration.builder()
        .email(NORMALIZED_EMAIL)
        .name(NAME)
        .hashedPassword(PASSWORD_ENCODER.encode(PASSWORD))
        .role(Role.USER)
        .verificationCode(VERIFICATION_CODE)
        .challenge(CHALLENGE)
        .createdAt(createdAt)
        .expiresAt(expiresAt)
        .build();
  }

  public static PendingRegistration freshPendingRegistration() {
    return pendingRegistration(LocalDateTime.now().plusMinutes(30));
  }

  public static PendingRegistration resendablePendingRegistration() {
    return pendingRegistration(LocalDateTime.now().plusSeconds(5));
  }

  public static PendingRegistration expiredPendingRegistration() {
    return pendingRegistration(LocalDateTime.now().minusMinutes(20));
  }

  public static AccountEntity account(Role role) {
    return AccountEntity.builder()
        .id(UUID.randomUUID())
        .email(NORMALIZED_EMAIL)
        .name(NAME)
        .password(PASSWORD_ENCODER.encode(PASSWORD))
        .role(role)
        .createdDate(LocalDateTime.now())
        .build();
  }

  public static String hashedPassword(String rawPassword) {
    return PASSWORD_ENCODER.encode(rawPassword);
  }

  public static boolean matchesPassword(String rawPassword, String hashedPassword) {
    return PASSWORD_ENCODER.matches(rawPassword, hashedPassword);
  }
}
