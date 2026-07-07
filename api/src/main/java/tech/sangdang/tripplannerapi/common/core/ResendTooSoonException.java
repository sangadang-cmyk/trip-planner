package tech.sangdang.tripplannerapi.common.core;

import org.springframework.http.HttpStatus;

public class ResendTooSoonException extends BusinessError {
  private static final String ERROR_CODE = "RESEND_TOO_SOON";

  public ResendTooSoonException() {
    super("Please wait before resending verification email");
  }

  @Override
  public HttpStatus getHttpStatus() {
    return HttpStatus.TOO_MANY_REQUESTS;
  }

  @Override
  public String getErrorCode() {
    return ERROR_CODE;
  }
}
