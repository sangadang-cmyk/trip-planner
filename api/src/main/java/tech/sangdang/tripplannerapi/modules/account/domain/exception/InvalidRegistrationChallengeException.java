package tech.sangdang.tripplannerapi.modules.account.domain.exception;

import org.springframework.http.HttpStatus;
import tech.sangdang.tripplannerapi.common.core.BusinessError;

public class InvalidRegistrationChallengeException extends BusinessError {
  private static final String ERROR_CODE = "INVALID_REGISTRATION_CHALLENGE";

  public InvalidRegistrationChallengeException() {
    super("Invalid registration challenge");
  }

  @Override
  public HttpStatus getHttpStatus() {
    return HttpStatus.BAD_REQUEST;
  }

  @Override
  public String getErrorCode() {
    return ERROR_CODE;
  }
}
