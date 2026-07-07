package tech.sangdang.tripplannerapi.modules.account.domain.exception;

import org.springframework.http.HttpStatus;
import tech.sangdang.tripplannerapi.common.core.BusinessError;

public class InvalidCredentialsException extends BusinessError {
  private static final String ERROR_CODE = "INVALID_CREDENTIALS";

  public InvalidCredentialsException() {
    super("Invalid email or password");
  }

  @Override
  public HttpStatus getHttpStatus() {
    return HttpStatus.UNAUTHORIZED;
  }

  @Override
  public String getErrorCode() {
    return ERROR_CODE;
  }
}
