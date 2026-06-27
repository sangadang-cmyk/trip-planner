package tech.sangdang.tripplannerapi.modules.account.app.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static tech.sangdang.tripplannerapi.modules.account.support.AuthenticationTestFixtures.ACCESS_TOKEN;
import static tech.sangdang.tripplannerapi.modules.account.support.AuthenticationTestFixtures.CHALLENGE;
import static tech.sangdang.tripplannerapi.modules.account.support.AuthenticationTestFixtures.EMAIL;
import static tech.sangdang.tripplannerapi.modules.account.support.AuthenticationTestFixtures.NORMALIZED_EMAIL;
import static tech.sangdang.tripplannerapi.modules.account.support.AuthenticationTestFixtures.NAME;
import static tech.sangdang.tripplannerapi.modules.account.support.AuthenticationTestFixtures.PASSWORD;
import static tech.sangdang.tripplannerapi.modules.account.support.AuthenticationTestFixtures.VERIFICATION_CODE;
import static tech.sangdang.tripplannerapi.modules.account.support.AuthenticationTestFixtures.account;
import static tech.sangdang.tripplannerapi.modules.account.support.AuthenticationTestFixtures.expiredPendingRegistration;
import static tech.sangdang.tripplannerapi.modules.account.support.AuthenticationTestFixtures.freshPendingRegistration;
import static tech.sangdang.tripplannerapi.modules.account.support.AuthenticationTestFixtures.loginRequest;
import static tech.sangdang.tripplannerapi.modules.account.support.AuthenticationTestFixtures.pendingRegistrationProperties;
import static tech.sangdang.tripplannerapi.modules.account.support.AuthenticationTestFixtures.registerRequest;
import static tech.sangdang.tripplannerapi.modules.account.support.AuthenticationTestFixtures.resendVerificationRequest;
import static tech.sangdang.tripplannerapi.modules.account.support.AuthenticationTestFixtures.resendablePendingRegistration;
import static tech.sangdang.tripplannerapi.modules.account.support.AuthenticationTestFixtures.verifyEmailRequest;

import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.openapitools.model.LoginResponse;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import tech.sangdang.tripplannerapi.common.core.ForbiddenException;
import tech.sangdang.tripplannerapi.common.core.ResendTooSoonException;
import tech.sangdang.tripplannerapi.modules.account.app.AccessTokenService;
import tech.sangdang.tripplannerapi.modules.account.domain.AccountEntity;
import tech.sangdang.tripplannerapi.modules.account.domain.PendingRegistration;
import tech.sangdang.tripplannerapi.modules.account.domain.Role;
import tech.sangdang.tripplannerapi.modules.account.domain.exception.EmailAlreadyRegisteredException;
import tech.sangdang.tripplannerapi.modules.account.domain.exception.InvalidCredentialsException;
import tech.sangdang.tripplannerapi.modules.account.domain.exception.InvalidRegistrationChallengeException;
import tech.sangdang.tripplannerapi.modules.account.domain.exception.InvalidVerificationCodeException;
import tech.sangdang.tripplannerapi.modules.account.domain.exception.PendingRegistrationExpiredException;
import tech.sangdang.tripplannerapi.modules.account.domain.exception.PendingRegistrationNotFoundException;
import tech.sangdang.tripplannerapi.modules.account.domain.port.PendingRegistrationStore;
import tech.sangdang.tripplannerapi.modules.account.domain.port.VerificationEmailService;
import tech.sangdang.tripplannerapi.modules.account.domain.repository.AccountRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthenticationService")
class AuthenticationServiceImplTest {
  @Mock private AccountRepository accountRepository;
  @Mock private PendingRegistrationStore pendingRegistrationStore;
  @Mock private AccessTokenService accessTokenService;
  @Mock private VerificationEmailService verificationEmailService;

  private AuthenticationServiceImpl authenticationService;

  @BeforeEach
  void setUp() {
    authenticationService =
        new AuthenticationServiceImpl(
            accountRepository,
            pendingRegistrationStore,
            new BCryptPasswordEncoder(),
            accessTokenService,
            verificationEmailService,
            pendingRegistrationProperties());

    lenient().when(accessTokenService.generateAccessToken(any())).thenReturn(ACCESS_TOKEN);
    lenient()
        .when(accountRepository.save(any(AccountEntity.class)))
        .thenAnswer(
            invocation -> {
              AccountEntity saved = invocation.getArgument(0);
              if (saved.getId() == null) {
                saved.setId(UUID.randomUUID());
              }
              if (saved.getCreatedDate() == null) {
                saved.setCreatedDate(java.time.LocalDateTime.now());
              }
              return saved;
            });
  }

  @Nested
  @DisplayName("register")
  class Register {
    @Test
    @DisplayName("stores pending registration and sends verification email")
    void storesPendingRegistrationAndSendsEmail() {
      when(accountRepository.findByEmail(NORMALIZED_EMAIL)).thenReturn(Optional.empty());

      var response = authenticationService.register(registerRequest());

      assertThat(response.getChallenge()).isNotBlank();

      ArgumentCaptor<PendingRegistration> pendingCaptor =
          ArgumentCaptor.forClass(PendingRegistration.class);
      verify(pendingRegistrationStore).save(pendingCaptor.capture());

      PendingRegistration saved = pendingCaptor.getValue();
      assertThat(saved.getEmail()).isEqualTo(NORMALIZED_EMAIL);
      assertThat(saved.getName()).isEqualTo(NAME);
      assertThat(saved.getRole()).isEqualTo(Role.USER);
      assertThat(saved.getChallenge()).isEqualTo(response.getChallenge());
      assertThat(saved.getVerificationCode()).hasSize(5);

      verify(verificationEmailService)
          .sendVerificationEmail(eq(NORMALIZED_EMAIL), eq(saved.getVerificationCode()));
    }

    @Test
    @DisplayName("rejects email that is already registered")
    void rejectsDuplicateEmail() {
      when(accountRepository.findByEmail(NORMALIZED_EMAIL))
          .thenReturn(Optional.of(account(Role.USER)));

      assertThatThrownBy(() -> authenticationService.register(registerRequest()))
          .isInstanceOf(EmailAlreadyRegisteredException.class);

      verify(pendingRegistrationStore, never()).save(any());
      verify(verificationEmailService, never()).sendVerificationEmail(any(), any());
    }
  }

  @Nested
  @DisplayName("verify email")
  class VerifyEmail {
    @Test
    @DisplayName("creates account and clears pending registration")
    void createsAccount() {
      PendingRegistration pending = freshPendingRegistration();
      when(pendingRegistrationStore.findByEmail(NORMALIZED_EMAIL))
          .thenReturn(Optional.of(pending));
      when(accountRepository.findByEmail(NORMALIZED_EMAIL)).thenReturn(Optional.empty());

      var response = authenticationService.verifyEmail(verifyEmailRequest());

      assertThat(response.getEmail()).isEqualTo(NORMALIZED_EMAIL);
      assertThat(response.getName()).isEqualTo(NAME);
      assertThat(response.getRole().name()).isEqualTo(Role.USER.name());

      ArgumentCaptor<AccountEntity> accountCaptor = ArgumentCaptor.forClass(AccountEntity.class);
      verify(accountRepository).save(accountCaptor.capture());
      assertThat(accountCaptor.getValue().getEmail()).isEqualTo(NORMALIZED_EMAIL);

      verify(pendingRegistrationStore).removeByEmail(NORMALIZED_EMAIL);
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource(
        "tech.sangdang.tripplannerapi.modules.account.app.impl.AuthenticationServiceImplTest#verifyEmailRejectionCases")
    @DisplayName("rejects invalid verification attempts")
    void rejectsInvalidVerification(
        String scenario,
        VerifyEmailRejectionSetup setup,
        String challenge,
        String verificationCode,
        Class<? extends Exception> expectedError) {
      applyVerifyEmailRejectionSetup(setup);

      var request =
          verifyEmailRequest().toBuilder()
              .challenge(challenge)
              .verificationCode(verificationCode)
              .build();

      assertThatThrownBy(() -> authenticationService.verifyEmail(request))
          .isInstanceOf(expectedError);

      verify(accountRepository, never()).save(any());
    }

    private void applyVerifyEmailRejectionSetup(VerifyEmailRejectionSetup setup) {
      switch (setup) {
        case PENDING_NOT_FOUND ->
            when(pendingRegistrationStore.findByEmail(NORMALIZED_EMAIL)).thenReturn(Optional.empty());
        case WRONG_CHALLENGE, WRONG_CODE ->
            when(pendingRegistrationStore.findByEmail(NORMALIZED_EMAIL))
                .thenReturn(Optional.of(freshPendingRegistration()));
        case ACCOUNT_ALREADY_EXISTS -> {
          when(pendingRegistrationStore.findByEmail(NORMALIZED_EMAIL))
              .thenReturn(Optional.of(freshPendingRegistration()));
          when(accountRepository.findByEmail(NORMALIZED_EMAIL))
              .thenReturn(Optional.of(account(Role.USER)));
        }
      }
    }
  }

  @Nested
  @DisplayName("login")
  class Login {
    @ParameterizedTest(name = "{0}")
    @MethodSource(
        "tech.sangdang.tripplannerapi.modules.account.app.impl.AuthenticationServiceImplTest#successfulLoginCases")
    @DisplayName("returns access token when credentials and role match")
    void returnsAccessToken(String scenario, Role role, LoginAction loginAction) {
      when(accountRepository.findByEmail(NORMALIZED_EMAIL))
          .thenReturn(Optional.of(account(role)));

      LoginResponse response = loginAction.invoke(authenticationService, loginRequest());

      assertThat(response.getAccessToken()).isEqualTo(ACCESS_TOKEN);
      verify(accessTokenService).generateAccessToken(any(AccountEntity.class));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource(
        "tech.sangdang.tripplannerapi.modules.account.app.impl.AuthenticationServiceImplTest#rejectedLoginCases")
    @DisplayName("rejects invalid login attempts")
    void rejectsInvalidLogin(
        String scenario,
        LoginAction loginAction,
        RejectedLoginSetup setup,
        Class<? extends Exception> expectedError) {
      applyLoginSetup(setup);

      assertThatThrownBy(() -> loginAction.invoke(authenticationService, loginRequest()))
          .isInstanceOf(expectedError);

      verify(accessTokenService, never()).generateAccessToken(any());
    }

    private void applyLoginSetup(RejectedLoginSetup setup) {
      switch (setup) {
        case UNKNOWN_EMAIL -> when(accountRepository.findByEmail(NORMALIZED_EMAIL))
            .thenReturn(Optional.empty());
        case WRONG_PASSWORD -> when(accountRepository.findByEmail(NORMALIZED_EMAIL))
            .thenReturn(Optional.of(account(Role.USER)));
        case USER_LOGIN_AS_ADMIN -> when(accountRepository.findByEmail(NORMALIZED_EMAIL))
            .thenReturn(Optional.of(account(Role.ADMIN)));
        case ADMIN_LOGIN_AS_USER -> when(accountRepository.findByEmail(NORMALIZED_EMAIL))
            .thenReturn(Optional.of(account(Role.USER)));
      }
    }
  }

  @Nested
  @DisplayName("resend verification")
  class ResendVerification {
    @Test
    @DisplayName("sends a new verification email when resend window is open")
    void resendsVerificationEmail() {
      when(accountRepository.findByEmail(NORMALIZED_EMAIL)).thenReturn(Optional.empty());
      when(pendingRegistrationStore.findByEmailRaw(NORMALIZED_EMAIL))
          .thenReturn(Optional.of(resendablePendingRegistration()));

      var response = authenticationService.resendVerification(resendVerificationRequest());

      assertThat(response.getMessage()).isEqualTo("Verification email sent");

      ArgumentCaptor<PendingRegistration> pendingCaptor =
          ArgumentCaptor.forClass(PendingRegistration.class);
      verify(pendingRegistrationStore).save(pendingCaptor.capture());

      PendingRegistration updated = pendingCaptor.getValue();
      assertThat(updated.getChallenge()).isEqualTo(CHALLENGE);
      assertThat(updated.getVerificationCode()).hasSize(5);

      verify(verificationEmailService)
          .sendVerificationEmail(eq(NORMALIZED_EMAIL), eq(updated.getVerificationCode()));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource(
        "tech.sangdang.tripplannerapi.modules.account.app.impl.AuthenticationServiceImplTest#resendVerificationRejectionCases")
    @DisplayName("rejects invalid resend attempts")
    void rejectsInvalidResend(
        String scenario,
        ResendVerificationRejectionSetup setup,
        String challenge,
        Class<? extends Exception> expectedError) {
      applyResendRejectionSetup(setup);

      var request =
          resendVerificationRequest().toBuilder().challenge(challenge).build();

      assertThatThrownBy(() -> authenticationService.resendVerification(request))
          .isInstanceOf(expectedError);

      verify(verificationEmailService, never()).sendVerificationEmail(any(), any());
    }

    private void applyResendRejectionSetup(ResendVerificationRejectionSetup setup) {
      switch (setup) {
        case ACCOUNT_ALREADY_REGISTERED ->
            when(accountRepository.findByEmail(NORMALIZED_EMAIL))
                .thenReturn(Optional.of(account(Role.USER)));
        case PENDING_NOT_FOUND -> {
          when(accountRepository.findByEmail(NORMALIZED_EMAIL)).thenReturn(Optional.empty());
          when(pendingRegistrationStore.findByEmailRaw(NORMALIZED_EMAIL)).thenReturn(Optional.empty());
        }
        case WRONG_CHALLENGE -> {
          when(accountRepository.findByEmail(NORMALIZED_EMAIL)).thenReturn(Optional.empty());
          when(pendingRegistrationStore.findByEmailRaw(NORMALIZED_EMAIL))
              .thenReturn(Optional.of(resendablePendingRegistration()));
        }
        case TOO_SOON -> {
          when(accountRepository.findByEmail(NORMALIZED_EMAIL)).thenReturn(Optional.empty());
          when(pendingRegistrationStore.findByEmailRaw(NORMALIZED_EMAIL))
              .thenReturn(Optional.of(freshPendingRegistration()));
        }
        case EXPIRED -> {
          when(accountRepository.findByEmail(NORMALIZED_EMAIL)).thenReturn(Optional.empty());
          when(pendingRegistrationStore.findByEmailRaw(NORMALIZED_EMAIL))
              .thenReturn(Optional.of(expiredPendingRegistration()));
        }
      }
    }
  }

  static Stream<Arguments> verifyEmailRejectionCases() {
    return Stream.of(
        Arguments.of(
            "pending registration not found",
            VerifyEmailRejectionSetup.PENDING_NOT_FOUND,
            CHALLENGE,
            VERIFICATION_CODE,
            PendingRegistrationNotFoundException.class),
        Arguments.of(
            "challenge does not match",
            VerifyEmailRejectionSetup.WRONG_CHALLENGE,
            "wrong-challenge",
            VERIFICATION_CODE,
            InvalidRegistrationChallengeException.class),
        Arguments.of(
            "verification code does not match",
            VerifyEmailRejectionSetup.WRONG_CODE,
            CHALLENGE,
            "WRONG",
            InvalidVerificationCodeException.class),
        Arguments.of(
            "account already exists",
            VerifyEmailRejectionSetup.ACCOUNT_ALREADY_EXISTS,
            CHALLENGE,
            VERIFICATION_CODE,
            EmailAlreadyRegisteredException.class));
  }

  static Stream<Arguments> successfulLoginCases() {
    return Stream.of(
        Arguments.of(
            "user login with USER account",
            Role.USER,
            (LoginAction) AuthenticationServiceImpl::loginUser),
        Arguments.of(
            "admin login with ADMIN account",
            Role.ADMIN,
            (LoginAction) AuthenticationServiceImpl::loginAdmin));
  }

  static Stream<Arguments> rejectedLoginCases() {
    return Stream.of(
        Arguments.of(
            "unknown email",
            (LoginAction) AuthenticationServiceImpl::loginUser,
            RejectedLoginSetup.UNKNOWN_EMAIL,
            InvalidCredentialsException.class),
        Arguments.of(
            "wrong password",
            (LoginAction)
                (service, request) ->
                    service.loginUser(
                        loginRequest().toBuilder().password("wrong-password").build()),
            RejectedLoginSetup.WRONG_PASSWORD,
            InvalidCredentialsException.class),
        Arguments.of(
            "user login with ADMIN account",
            (LoginAction) AuthenticationServiceImpl::loginUser,
            RejectedLoginSetup.USER_LOGIN_AS_ADMIN,
            ForbiddenException.class),
        Arguments.of(
            "admin login with USER account",
            (LoginAction) AuthenticationServiceImpl::loginAdmin,
            RejectedLoginSetup.ADMIN_LOGIN_AS_USER,
            ForbiddenException.class));
  }

  static Stream<Arguments> resendVerificationRejectionCases() {
    return Stream.of(
        Arguments.of(
            "account already registered",
            ResendVerificationRejectionSetup.ACCOUNT_ALREADY_REGISTERED,
            CHALLENGE,
            EmailAlreadyRegisteredException.class),
        Arguments.of(
            "pending registration not found",
            ResendVerificationRejectionSetup.PENDING_NOT_FOUND,
            CHALLENGE,
            PendingRegistrationNotFoundException.class),
        Arguments.of(
            "challenge does not match",
            ResendVerificationRejectionSetup.WRONG_CHALLENGE,
            "wrong-challenge",
            InvalidRegistrationChallengeException.class),
        Arguments.of(
            "resend requested too soon",
            ResendVerificationRejectionSetup.TOO_SOON,
            CHALLENGE,
            ResendTooSoonException.class),
        Arguments.of(
            "pending registration expired",
            ResendVerificationRejectionSetup.EXPIRED,
            CHALLENGE,
            PendingRegistrationExpiredException.class));
  }

  @FunctionalInterface
  interface LoginAction {
    LoginResponse invoke(AuthenticationServiceImpl service, org.openapitools.model.LoginRequest request);
  }

  enum RejectedLoginSetup {
    UNKNOWN_EMAIL,
    WRONG_PASSWORD,
    USER_LOGIN_AS_ADMIN,
    ADMIN_LOGIN_AS_USER
  }

  enum VerifyEmailRejectionSetup {
    PENDING_NOT_FOUND,
    WRONG_CHALLENGE,
    WRONG_CODE,
    ACCOUNT_ALREADY_EXISTS
  }

  enum ResendVerificationRejectionSetup {
    ACCOUNT_ALREADY_REGISTERED,
    PENDING_NOT_FOUND,
    WRONG_CHALLENGE,
    TOO_SOON,
    EXPIRED
  }
}
