package tech.sangdang.tripplannerapi.modules.account.domain.exception;

import org.springframework.http.HttpStatus;
import tech.sangdang.tripplannerapi.common.core.BusinessError;

public class PendingRegistrationExpiredException extends BusinessError {
  private static final String ERROR_CODE = "PENDING_REGISTRATION_EXPIRED";

  public PendingRegistrationExpiredException() {
    super("Pending registration has expired");
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
