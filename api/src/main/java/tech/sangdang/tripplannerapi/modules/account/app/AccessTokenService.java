package tech.sangdang.tripplannerapi.modules.account.app;

import tech.sangdang.tripplannerapi.modules.account.domain.AccountEntity;

public interface AccessTokenService {
  String generateAccessToken(AccountEntity account);
}
