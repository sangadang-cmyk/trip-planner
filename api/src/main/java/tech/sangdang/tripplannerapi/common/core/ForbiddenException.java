package tech.sangdang.tripplannerapi.common.core;

import org.springframework.http.HttpStatus;

public class ForbiddenException extends BusinessError {
  private static final String ERROR_CODE = "FORBIDDEN";

  public ForbiddenException(String message) {
    super(message);
  }

  @Override
  public HttpStatus getHttpStatus() {
    return HttpStatus.FORBIDDEN;
  }

  @Override
  public String getErrorCode() {
    return ERROR_CODE;
  }
}
