package tech.sangdang.tripplannerapi.modules.account.api;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.openapitools.api.AccountManagementApi;
import org.openapitools.model.AccountResponse;
import org.openapitools.model.PaginatedAccountsResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RestController;
import tech.sangdang.tripplannerapi.modules.account.app.AccountManagementService;
import tech.sangdang.tripplannerapi.modules.account.infra.AccountUserDetails;

@RestController
@RequiredArgsConstructor
public class AccountManagementController implements AccountManagementApi {
  private final AccountManagementService accountManagementService;

  @Override
  public ResponseEntity<PaginatedAccountsResponse> adminAccountsGet(Integer page, Integer size) {
    PaginatedAccountsResponse response =
        accountManagementService.getAccounts(page, size);
    return ResponseEntity.ok(response);
  }

  @Override
  public ResponseEntity<AccountResponse> adminAccountsIdGet(UUID id) {
    AccountResponse response = accountManagementService.getAccountById(id);
    return ResponseEntity.ok(response);
  }

  @Override
  public ResponseEntity<AccountResponse> privateAccountMeGet() {
    AccountUserDetails userDetails =
        (AccountUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    AccountResponse response =
        accountManagementService.getAccountById(userDetails.getAccount().getId());
    return ResponseEntity.ok(response);
  }
}
