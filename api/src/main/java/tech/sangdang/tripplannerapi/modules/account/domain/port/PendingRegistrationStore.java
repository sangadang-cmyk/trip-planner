package tech.sangdang.tripplannerapi.modules.account.domain.port;

import java.util.Optional;
import tech.sangdang.tripplannerapi.modules.account.domain.PendingRegistration;

public interface PendingRegistrationStore {
  boolean existsByEmail(String email);

  void save(PendingRegistration registration);

  Optional<PendingRegistration> findByEmail(String email);

  void removeByEmail(String email);

  void removeExpired();
}
