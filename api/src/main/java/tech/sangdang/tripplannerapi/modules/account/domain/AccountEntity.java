package tech.sangdang.tripplannerapi.modules.account.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(
    name = AccountEntity.TABLE,
    indexes = {@Index(name = "idx_account_email", columnList = "email")} // used for searching the account by email
    )
@Entity
public class AccountEntity {
  public static final String TABLE = "accounts";

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  
  @CreatedDate
  private LocalDateTime createdDate;
  
  @LastModifiedDate
  private LocalDateTime lastModifiedDate;

  @Column(nullable = false, name = "name", length = 255)
  private String name;

  @Column(nullable = false, name = "email", length = 255, updatable = false)
  private String email;

  @Column(nullable = false, name = "password", length = 255)
  private String password;
  
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, name = "role", length = 50)
  private Role role;
}
