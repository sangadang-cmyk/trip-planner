package tech.sangdang.tripplannerapi.modules.location.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = CityEntity.TABLE)
@Entity
public class CityEntity {
  public static final String TABLE = "cities";

  @Id
  @Column(name = "osm_id", nullable = false)
  private Long osmId;

  @Column(nullable = false, name = "osm_type", length = 16)
  private String osmType;

  @Column(nullable = false, name = "name", length = 255)
  private String name;
}
