package tech.sangdang.tripplannerapi.modules.location.domain;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;
import org.springframework.data.annotation.CreatedDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = OpenTripMapRequestEntity.TABLE)
@Entity
public class OpenTripMapRequestEntity {
  public static final String TABLE = "open_trip_map_requests";

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @CreatedDate
  @Column(nullable = false, name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(nullable = false, name = "min_lat")
  private Double minLat;

  @Column(nullable = false, name = "max_lat")
  private Double maxLat;

  @Column(nullable = false, name = "min_lng")
  private Double minLng;

  @Column(nullable = false, name = "max_lng")
  private Double maxLng;

  @Type(JsonType.class)
  @Column(name = "response", columnDefinition = "jsonb")
  private String response;
}
