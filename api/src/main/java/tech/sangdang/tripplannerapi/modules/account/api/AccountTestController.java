package tech.sangdang.tripplannerapi.modules.account.api;

import java.time.ZoneOffset;
import lombok.RequiredArgsConstructor;
import org.openapitools.model.AccountResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import tech.sangdang.tripplannerapi.modules.account.domain.AccountEntity;
import tech.sangdang.tripplannerapi.modules.account.infra.AccountUserDetails;

@RestController
@RequiredArgsConstructor
public class AccountTestController {

  @GetMapping("/admin/account/me")
  public AccountResponse getAdminAccount(@AuthenticationPrincipal AccountUserDetails userDetails) {
    return toAccountResponse(userDetails.getAccount());
  }

  @GetMapping("/user/account/me")
  public AccountResponse getUserAccount(@AuthenticationPrincipal AccountUserDetails userDetails) {
    return toAccountResponse(userDetails.getAccount());
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
