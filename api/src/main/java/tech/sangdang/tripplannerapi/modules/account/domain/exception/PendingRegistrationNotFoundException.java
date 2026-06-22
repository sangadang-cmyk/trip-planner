package tech.sangdang.tripplannerapi.modules.account.domain.exception;

import org.springframework.http.HttpStatus;
import tech.sangdang.tripplannerapi.common.core.BusinessError;

public class PendingRegistrationNotFoundException extends BusinessError {
  private static final String ERROR_CODE = "PENDING_REGISTRATION_NOT_FOUND";

  public PendingRegistrationNotFoundException() {
    super("No pending registration found for this email");
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
