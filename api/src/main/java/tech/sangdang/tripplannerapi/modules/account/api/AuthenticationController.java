package tech.sangdang.tripplannerapi.modules.account.api;

import org.jspecify.annotations.Nullable;
import org.openapitools.api.AuthenticationApi;
import org.openapitools.model.AccountResponse;
import org.openapitools.model.AuthRefreshPost200Response;
import org.openapitools.model.AuthRefreshPostRequest;
import org.openapitools.model.LoginRequest;
import org.openapitools.model.LoginResponse;
import org.openapitools.model.RegisterRequest;import org.openapitools.model.RegisterResponse;
import org.openapitools.model.ResendVerificationRequest;
import org.openapitools.model.ResendVerificationResponse;
import org.openapitools.model.VerifyEmailRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tech.sangdang.tripplannerapi.modules.account.app.AuthenticationService;

@Slf4j
@RequiredArgsConstructor
@RestController
public class AuthenticationController implements AuthenticationApi {
    private final AuthenticationService authenticationService;

    @Override
    public ResponseEntity<LoginResponse> authUserLoginPost(LoginRequest loginRequest) {
        LoginResponse response = authenticationService.loginUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<LoginResponse> authAdminLoginPost(LoginRequest loginRequest) {
        LoginResponse response = authenticationService.loginAdmin(loginRequest);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<AuthRefreshPost200Response> authRefreshPost(@Nullable AuthRefreshPostRequest authRefreshPostRequest) {
        return AuthenticationApi.super.authRefreshPost(authRefreshPostRequest);
    }

    @Override
    public ResponseEntity<RegisterResponse> authRegisterPost(RegisterRequest registerRequest) {
        RegisterResponse response = authenticationService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<ResendVerificationResponse> authResendVerificationPost(
        ResendVerificationRequest resendVerificationRequest) {
        ResendVerificationResponse response =
            authenticationService.resendVerification(resendVerificationRequest);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<AccountResponse> authVerifyEmailPost(VerifyEmailRequest verifyEmailRequest) {
        AccountResponse response = authenticationService.verifyEmail(verifyEmailRequest);
        return ResponseEntity.ok(response);
    }
}
