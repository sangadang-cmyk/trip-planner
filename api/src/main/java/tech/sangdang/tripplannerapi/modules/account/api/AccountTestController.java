package tech.sangdang.tripplannerapi.modules.account.api;

import java.time.ZoneOffset;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.openapitools.model.AccountResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import tech.sangdang.tripplannerapi.modules.account.domain.AccountEntity;
import tech.sangdang.tripplannerapi.modules.account.infra.AccountUserDetails;

import static tech.sangdang.tripplannerapi.config.SwaggerConfig.BEARER_AUTH;

@RestController
@RequiredArgsConstructor
public class AccountTestController {

  @SecurityRequirement(name = BEARER_AUTH)
  @GetMapping("/admin/account/me")
  public AccountResponse getAdminAccount(@AuthenticationPrincipal AccountUserDetails userDetails) {
    return toAccountResponse(userDetails.getAccount());
  }

  @SecurityRequirement(name = BEARER_AUTH)
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
