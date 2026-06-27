package tech.sangdang.tripplannerapi.common.core;

import org.springframework.http.HttpStatus;

public class BadRequestException extends BusinessError {
  private static final String ERROR_CODE = "BAD_REQUEST";

  public BadRequestException(String message) {
    super(message);
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
