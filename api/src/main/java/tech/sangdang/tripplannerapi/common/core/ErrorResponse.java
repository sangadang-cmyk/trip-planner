package tech.sangdang.tripplannerapi.common.core;

import java.time.LocalDateTime;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    LocalDateTime timestamp;
    Integer status;
    String error;
    String message;
    String path;
}
