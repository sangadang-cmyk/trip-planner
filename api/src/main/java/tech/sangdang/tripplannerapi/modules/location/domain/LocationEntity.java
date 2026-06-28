package tech.sangdang.tripplannerapi.modules.location.domain;

import io.hypersistence.utils.hibernate.type.array.StringArrayType;
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
import org.hibernate.annotations.Type;
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
      @Index(name = "idx_location_city_id", columnList = "city_id"),
      @Index(name = "idx_location_country_id", columnList = "country_id"),
      @Index(name = "idx_location_google_maps_id", columnList = "google_maps_id", unique = true)
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

  @Column(nullable = false, name = "city_id")
  private UUID cityId;

  @Column(nullable = false, name = "country_id")
  private UUID countryId;

  @Column(nullable = true, name = "city_display_name")
  private String cityDisplayName;

  @Column(nullable = true, name = "country_display_name")
  private String countryDisplayName;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, name = "source", length = 50)
  private LocationSource source;

  @Column(name = "google_maps_id", length = 255)
  private String googleMapsId;

  @Column(name = "added_by", length = 255)
  private String addedBy;

  @Type(StringArrayType.class)
  @Column(name = "images", columnDefinition = "text[]")
  @Builder.Default
  private String[] images = new String[0];
}
