package tech.sangdang.tripplannerapi.modules.trip.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(
    name = TripEntity.TABLE,
    indexes = {@Index(name = "idx_trip_user_id", columnList = "user_id")})
@Entity
public class TripEntity {
  public static final String TABLE = "trips";

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @CreatedDate
  @Column(nullable = false, name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @LastModifiedDate
  @Column(nullable = false, name = "updated_at")
  private LocalDateTime updatedAt;

  @Column(nullable = false, name = "user_id")
  private UUID userId;

  @Column(nullable = false, name = "name", length = 255)
  private String name;

  @Column(nullable = false, name = "start_date")
  private LocalDate startDate;

  @Column(nullable = false, name = "end_date")
  private LocalDate endDate;

  @Column(name = "notes", columnDefinition = "text")
  private String notes;
}
