package tech.sangdang.tripplannerapi.modules.trip.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import tech.sangdang.tripplannerapi.modules.location.domain.LocationEntity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = TripDestinationEntity.TABLE)
@Entity
public class TripDestinationEntity {
  public static final String TABLE = "trip_destinations";
  public static final int UNSORTED_DAY_NUMBER = -1;

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @CreatedDate
  @Column(nullable = false, name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @LastModifiedDate
  @Column(nullable = false, name = "updated_at")
  private LocalDateTime updatedAt;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(nullable = false, name = "trip_id")
  private TripEntity trip;

  @ManyToOne(fetch = FetchType.LAZY, optional = false, targetEntity = LocationEntity.class)
  @JoinColumn(nullable = false, name = "location_id")
  private LocationEntity location;

  @Column(nullable = false, name = "day_number")
  @Builder.Default
  private int dayNumber = UNSORTED_DAY_NUMBER;

  @Column(nullable = false, name = "sort_order")
  private int sortOrder;

  @Column(name = "notes", columnDefinition = "text")
  private String notes;

  @Column(name = "deleted_date", nullable = true)
  private LocalDateTime deletedDate;
}
