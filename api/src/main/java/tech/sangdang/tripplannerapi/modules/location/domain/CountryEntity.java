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
    name = CountryEntity.TABLE,
    indexes = {@Index(name = "idx_country_code", columnList = "code", unique = true)})
@Entity
public class CountryEntity {
  public static final String TABLE = "countries";

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, name = "name", length = 255)
  private String name;

  @Column(name = "code", length = 3, unique = true)
  private String code;

  @Type(StringArrayType.class)
  @Column(name = "aliases", columnDefinition = "text[]")
  @Builder.Default
  private String[] aliases = new String[0];
}
