package tech.sangdang.tripplannerapi.common.core;

import org.springframework.http.HttpStatus;

public class NotFoundException extends BusinessError {
  private static final String ERROR_CODE = "NOT_FOUND";

  public NotFoundException(String message) {
    super(message);
  }

  @Override
  public HttpStatus getHttpStatus() {
    return HttpStatus.NOT_FOUND;
  }

  @Override
  public String getErrorCode() {
    return ERROR_CODE;
  }
}
