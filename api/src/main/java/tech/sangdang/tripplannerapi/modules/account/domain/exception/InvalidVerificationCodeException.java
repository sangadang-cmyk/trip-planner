package tech.sangdang.tripplannerapi.modules.account.domain.exception;

import org.springframework.http.HttpStatus;
import tech.sangdang.tripplannerapi.common.core.BusinessError;

public class InvalidVerificationCodeException extends BusinessError {
  private static final String ERROR_CODE = "INVALID_VERIFICATION_CODE";

  public InvalidVerificationCodeException() {
    super("Invalid verification code");
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
