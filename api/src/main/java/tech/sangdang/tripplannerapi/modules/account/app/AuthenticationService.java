package tech.sangdang.tripplannerapi.modules.account.app;

import org.openapitools.model.AccountResponse;
import org.openapitools.model.LoginRequest;
import org.openapitools.model.LoginResponse;
import org.openapitools.model.RegisterRequest;
import org.openapitools.model.RegisterResponse;
import org.openapitools.model.ResendVerificationRequest;
import org.openapitools.model.ResendVerificationResponse;
import org.openapitools.model.VerifyEmailRequest;

public interface AuthenticationService {
  LoginResponse login(LoginRequest loginRequest);

  RegisterResponse register(RegisterRequest registerRequest);

  AccountResponse verifyEmail(VerifyEmailRequest verifyEmailRequest);

  ResendVerificationResponse resendVerification(ResendVerificationRequest request);
}
