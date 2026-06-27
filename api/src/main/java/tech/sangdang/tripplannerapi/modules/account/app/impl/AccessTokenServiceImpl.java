package tech.sangdang.tripplannerapi.modules.account.app.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import tech.sangdang.tripplannerapi.modules.account.app.AccessTokenService;
import tech.sangdang.tripplannerapi.modules.account.domain.AccountEntity;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AccessTokenServiceImpl implements AccessTokenService {
  private static final String ISSUER = "trip-planner-api";

  private final JwtEncoder jwtEncoder;

  @Override
  public String generateAccessToken(AccountEntity account) {
    JwtClaimsSet claims =
        JwtClaimsSet.builder()
            .issuer(ISSUER)
            .issuedAt(Instant.now())
            .subject(account.getId().toString())
            .claim("email", account.getEmail())
            .claim("role", account.getRole().name())
            .build();

    return jwtEncoder
        .encode(
            JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
        .getTokenValue();
  }
}
