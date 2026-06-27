package tech.sangdang.tripplannerapi.modules.location.domain;

import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(
    name = CityEntity.TABLE,
    indexes = {@Index(name = "idx_city_country_id", columnList = "country_id")})
@Entity
public class CityEntity {
  public static final String TABLE = "cities";

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, name = "name", length = 255)
  private String name;

  @Column(nullable = false, name = "country_id")
  private UUID countryId;

  @Type(StringArrayType.class)
  @Column(name = "aliases", columnDefinition = "text[]")
  @Builder.Default
  private String[] aliases = new String[0];
}
