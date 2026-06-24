package tech.sangdang.tripplannerapi.modules.account.app.impl;

import java.time.ZoneOffset;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.openapitools.model.AccountResponse;
import org.openapitools.model.PaginatedAccountsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import tech.sangdang.tripplannerapi.modules.account.app.AccountManagementService;
import tech.sangdang.tripplannerapi.modules.account.domain.AccountEntity;
import tech.sangdang.tripplannerapi.common.core.NotFoundException;
import tech.sangdang.tripplannerapi.modules.account.domain.repository.AccountRepository;

@Service
@RequiredArgsConstructor
public class AccountManagementServiceImpl implements AccountManagementService {
  private final AccountRepository accountRepository;

  @Override
  public PaginatedAccountsResponse getAccounts(int page, int size) {
    Page<AccountEntity> accountPage = accountRepository.findAll(PageRequest.of(page, size));

    return PaginatedAccountsResponse.builder()
        .content(accountPage.getContent().stream().map(this::toAccountResponse).toList())
        .page(accountPage.getNumber())
        .size(accountPage.getSize())
        .totalElements(accountPage.getTotalElements())
        .totalPages(accountPage.getTotalPages())
        .build();
  }

  @Override
  public AccountResponse getAccountById(UUID id) {
    AccountEntity account =
        accountRepository
            .findById(id)
            .orElseThrow(() -> new NotFoundException("Account not found"));

    return toAccountResponse(account);
  }

  private AccountResponse toAccountResponse(AccountEntity account) {
    return AccountResponse.builder()
        .id(account.getId())
        .email(account.getEmail())
        .name(account.getName())
        .role(AccountResponse.RoleEnum.fromValue(account.getRole().name()))
        .createdAt(account.getCreatedDate().atOffset(ZoneOffset.UTC))
        .build();
  }
}
