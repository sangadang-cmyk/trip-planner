package tech.sangdang.tripplannerapi.modules.location.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
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
    name = LocationEntity.TABLE,
    indexes = {
      @Index(name = "idx_location_source_id", columnList = "source_id", unique = true)
    })
@Entity
public class LocationEntity {
  public static final String TABLE = "locations";

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @CreatedDate
  @Column(nullable = false, name = "created_date", updatable = false)
  private LocalDateTime createdDate;

  @LastModifiedDate
  @Column(nullable = false, name = "last_modified_date")
  private LocalDateTime lastModifiedDate;

  @Column(nullable = false, name = "name", length = 255)
  private String name;

  @Column(name = "latitude")
  private Double latitude;

  @Column(name = "longitude")
  private Double longitude;

  @Column(nullable = false, name = "popularity")
  @Builder.Default
  private int popularity = 0;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, name = "source", length = 50)
  private LocationSource source;

  @Column(name = "source_id", length = 255)
  private String sourceId;

  @Column(name = "added_by", length = 255)
  private String addedBy;
}
