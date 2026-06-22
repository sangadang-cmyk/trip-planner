package tech.sangdang.tripplannerapi.modules.account.infra;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import tech.sangdang.tripplannerapi.modules.account.domain.PendingRegistration;
import tech.sangdang.tripplannerapi.modules.account.domain.exception.PendingRegistrationExpiredException;
import tech.sangdang.tripplannerapi.modules.account.domain.port.PendingRegistrationStore;

@Component
public class InMemoryPendingRegistrationStore implements PendingRegistrationStore {
  private final ConcurrentHashMap<String, PendingRegistration> registrationsByEmail =
      new ConcurrentHashMap<>();

  @Override
  public boolean existsByEmail(String email) {
    String key = normalizeEmail(email);
    PendingRegistration registration = registrationsByEmail.get(key);
    if (registration == null) {
      return false;
    }
    if (registration.isExpired(LocalDateTime.now())) {
      registrationsByEmail.remove(key);
      return false;
    }
    return true;
  }

  @Override
  public void save(PendingRegistration registration) {
    registrationsByEmail.put(normalizeEmail(registration.getEmail()), registration);
  }

  @Override
  public Optional<PendingRegistration> findByEmail(String email) {
    String key = normalizeEmail(email);
    PendingRegistration registration = registrationsByEmail.get(key);
    if (registration == null) {
      return Optional.empty();
    }
    if (registration.isExpired(LocalDateTime.now())) {
      registrationsByEmail.remove(key);
      throw new PendingRegistrationExpiredException();
    }
    return Optional.of(registration);
  }

  @Override
  public void removeByEmail(String email) {
    registrationsByEmail.remove(normalizeEmail(email));
  }

  @Override
  public void removeExpired() {
    LocalDateTime now = LocalDateTime.now();
    registrationsByEmail
        .entrySet()
        .removeIf(entry -> entry.getValue().isExpired(now));
  }

  private String normalizeEmail(String email) {
    return email.trim().toLowerCase();
  }
}
