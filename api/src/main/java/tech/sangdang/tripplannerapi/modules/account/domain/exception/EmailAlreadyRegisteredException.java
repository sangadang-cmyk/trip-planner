package tech.sangdang.tripplannerapi.modules.account.domain.exception;

import org.springframework.http.HttpStatus;
import tech.sangdang.tripplannerapi.common.core.BusinessError;

public class EmailAlreadyRegisteredException extends BusinessError {
  private static final String ERROR_CODE = "EMAIL_ALREADY_REGISTERED";

  public EmailAlreadyRegisteredException() {
    super("Email already registered");
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
