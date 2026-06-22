package tech.sangdang.tripplannerapi.common.core;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class BusinessErrorProcessor {
    @ExceptionHandler(BusinessError.class)
    public ResponseEntity<ErrorResponse> handleBusinessError(BusinessError ex, HttpServletRequest request) {
    ErrorResponse error =
        ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(ex.getHttpStatus().value())
            .error(ex.getErrorCode())
            .message(ex.getMessage())
            .path(request.getRequestURI())
            .build();

        return new ResponseEntity<>(error, ex.getHttpStatus());
    }
}
