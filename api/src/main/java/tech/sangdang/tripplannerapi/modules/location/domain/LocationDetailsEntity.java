package tech.sangdang.tripplannerapi.modules.location.domain;

import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
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
@Table(name = LocationDetailsEntity.TABLE)
@Entity
public class LocationDetailsEntity {
  public static final String TABLE = "location_details";
  public static final String DEFAULT_SOURCE = "openstreetmaps";

  @Id
  private UUID id;

  @Type(StringArrayType.class)
  @Column(name = "images", columnDefinition = "text[]")
  @Builder.Default
  private String[] images = new String[0];

  @Type(StringArrayType.class)
  @Column(name = "preview_images", columnDefinition = "text[]")
  @Builder.Default
  private String[] previewImages = new String[0];

  @Type(StringArrayType.class)
  @Column(name = "kinds", columnDefinition = "text[]")
  @Builder.Default
  private String[] kinds = new String[0];

  @Column(name = "description", columnDefinition = "text")
  @Builder.Default
  private String description = "";

  @Column(nullable = false, name = "popularity")
  @Builder.Default
  private int popularity = 0;

  @Column(name = "country", length = 255)
  private String country;

  @Column(name = "state", length = 255)
  private String state;

  @Column(nullable = false, name = "source", length = 50)
  @Builder.Default
  private String source = DEFAULT_SOURCE;
}
