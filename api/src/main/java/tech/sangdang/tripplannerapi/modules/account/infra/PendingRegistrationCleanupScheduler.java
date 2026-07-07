package tech.sangdang.tripplannerapi.modules.account.infra;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tech.sangdang.tripplannerapi.modules.account.domain.port.PendingRegistrationStore;

@Slf4j
@Component
@RequiredArgsConstructor
public class PendingRegistrationCleanupScheduler {
  private final PendingRegistrationStore pendingRegistrationStore;

  @Scheduled(cron = "${app.auth.pending-registration.cleanup-cron}")
  public void removeExpiredPendingRegistrations() {
    pendingRegistrationStore.removeExpired();
    log.debug("Removed expired pending registrations");
  }
}
