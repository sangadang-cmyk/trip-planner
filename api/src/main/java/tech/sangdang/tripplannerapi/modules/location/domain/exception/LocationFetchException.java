package tech.sangdang.tripplannerapi.modules.location.domain.exception;

import org.springframework.http.HttpStatus;
import tech.sangdang.tripplannerapi.common.core.BusinessError;

public class LocationFetchException extends BusinessError {
  private static final String ERROR_CODE = "LOCATION_FETCH_FAILED";

  public LocationFetchException(String message, Throwable cause) {
    super(message, cause);
  }

  @Override
  public HttpStatus getHttpStatus() {
    return HttpStatus.BAD_GATEWAY;
  }

  @Override
  public String getErrorCode() {
    return ERROR_CODE;
  }
}
