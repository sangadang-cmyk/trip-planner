package tech.sangdang.tripplannerapi.modules.account.app.impl;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Objects;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.openapitools.model.AccountResponse;
import org.openapitools.model.LoginRequest;
import org.openapitools.model.LoginResponse;
import org.openapitools.model.RegisterRequest;
import org.openapitools.model.RegisterResponse;
import org.openapitools.model.VerifyEmailRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tech.sangdang.tripplannerapi.config.properties.PendingRegistrationProperties;
import tech.sangdang.tripplannerapi.modules.account.app.AccessTokenService;
import tech.sangdang.tripplannerapi.modules.account.app.AuthenticationService;
import tech.sangdang.tripplannerapi.modules.account.domain.AccountEntity;
import tech.sangdang.tripplannerapi.modules.account.domain.PendingRegistration;
import tech.sangdang.tripplannerapi.modules.account.domain.Role;
import tech.sangdang.tripplannerapi.modules.account.domain.exception.EmailAlreadyRegisteredException;
import tech.sangdang.tripplannerapi.modules.account.domain.exception.InvalidCredentialsException;
import tech.sangdang.tripplannerapi.modules.account.domain.exception.InvalidRegistrationChallengeException;
import tech.sangdang.tripplannerapi.modules.account.domain.exception.InvalidVerificationCodeException;
import tech.sangdang.tripplannerapi.modules.account.domain.exception.PendingRegistrationNotFoundException;
import tech.sangdang.tripplannerapi.modules.account.domain.port.PendingRegistrationStore;
import tech.sangdang.tripplannerapi.modules.account.domain.port.VerificationEmailService;
import tech.sangdang.tripplannerapi.modules.account.domain.repository.AccountRepository;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
  private static final String VERIFICATION_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  private static final int VERIFICATION_CODE_LENGTH = 5;

  private final AccountRepository accountRepository;
  private final PendingRegistrationStore pendingRegistrationStore;
  private final PasswordEncoder passwordEncoder;
  private final AccessTokenService accessTokenService;
  private final VerificationEmailService verificationEmailService;
  private final PendingRegistrationProperties pendingRegistrationProperties;
  private final SecureRandom secureRandom = new SecureRandom();

  @Override
  public LoginResponse login(LoginRequest loginRequest) {
    var account =
        accountRepository
            .findByEmail(loginRequest.getEmail())
            .orElseThrow(InvalidCredentialsException::new);

    if (!passwordEncoder.matches(loginRequest.getPassword(), account.getPassword())) {
      throw new InvalidCredentialsException();
    }

    String accessToken = accessTokenService.generateAccessToken(account);

    return LoginResponse.builder().accessToken(accessToken).build();
  }

  @Override
  public RegisterResponse register(RegisterRequest registerRequest) {
    String normalizedEmail = registerRequest.getEmail().trim().toLowerCase();

    if (accountRepository.findByEmail(normalizedEmail).isPresent()) {
      throw new EmailAlreadyRegisteredException();
    }

    String verificationCode = generateVerificationCode();
    String challenge = generateChallenge();
    LocalDateTime now = LocalDateTime.now();
    PendingRegistration pendingRegistration =
        PendingRegistration.builder()
            .email(normalizedEmail)
            .name(registerRequest.getName())
            .hashedPassword(passwordEncoder.encode(registerRequest.getPassword()))
            .role(Role.USER)
            .verificationCode(verificationCode)
            .challenge(challenge)
            .createdAt(now)
            .expiresAt(now.plus(pendingRegistrationProperties.expiration()))
            .build();

    pendingRegistrationStore.save(pendingRegistration);

    try {
      verificationEmailService.sendVerificationEmail(normalizedEmail, verificationCode);
    } catch (RuntimeException exception) {
      pendingRegistrationStore.removeByEmail(normalizedEmail);
      throw exception;
    }

    return RegisterResponse.builder().challenge(challenge).build();
  }

  @Override
  public AccountResponse verifyEmail(VerifyEmailRequest verifyEmailRequest) {
    String normalizedEmail = verifyEmailRequest.getEmail().trim().toLowerCase();

    PendingRegistration pendingRegistration =
        pendingRegistrationStore
            .findByEmail(normalizedEmail)
            .orElseThrow(PendingRegistrationNotFoundException::new);

    if (!Objects.equals(pendingRegistration.getChallenge(), verifyEmailRequest.getChallenge())) {
      throw new InvalidRegistrationChallengeException();
    }

    if (!Objects.equals(
        pendingRegistration.getVerificationCode(), verifyEmailRequest.getVerificationCode())) {
      throw new InvalidVerificationCodeException();
    }

    if (accountRepository.findByEmail(normalizedEmail).isPresent()) {
      pendingRegistrationStore.removeByEmail(normalizedEmail);
      throw new EmailAlreadyRegisteredException();
    }

    AccountEntity account =
        AccountEntity.builder()
            .name(pendingRegistration.getName())
            .email(pendingRegistration.getEmail())
            .password(pendingRegistration.getHashedPassword())
            .role(pendingRegistration.getRole())
            .build();

    account = accountRepository.save(account);
    pendingRegistrationStore.removeByEmail(normalizedEmail);

    return AccountResponse.builder()
        .id(account.getId())
        .email(account.getEmail())
        .name(account.getName())
        .role(AccountResponse.RoleEnum.fromValue(account.getRole().name()))
        .createdAt(account.getCreatedDate().atOffset(ZoneOffset.UTC))
        .build();
  }

  private String generateChallenge() {
    return UUID.randomUUID().toString().replace("-", "");
  }

  private String generateVerificationCode() {
    StringBuilder code = new StringBuilder(VERIFICATION_CODE_LENGTH);
    for (int i = 0; i < VERIFICATION_CODE_LENGTH; i++) {
      code.append(
          VERIFICATION_CODE_CHARS.charAt(
              secureRandom.nextInt(VERIFICATION_CODE_CHARS.length())));
    }
    return code.toString();
  }
}
