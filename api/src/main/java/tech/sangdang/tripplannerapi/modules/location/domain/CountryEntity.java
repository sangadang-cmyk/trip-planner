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
@Table(name = CountryEntity.TABLE)
@Entity
public class CountryEntity {
  public static final String TABLE = "countries";

  @Id private Long id;

  @Column(nullable = false, name = "name", length = 255)
  private String name;
}
