package tech.sangdang.tripplannerapi.modules.account.app;

import java.util.UUID;
import org.openapitools.model.AccountResponse;
import org.openapitools.model.PaginatedAccountsResponse;

public interface AccountManagementService {
  PaginatedAccountsResponse getAccounts(int page, int size);

  AccountResponse getAccountById(UUID id);
}
