package tech.sangdang.tripplannerapi.modules.account.infra;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tech.sangdang.tripplannerapi.modules.account.domain.repository.AccountRepository;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  private static final String BEARER_PREFIX = "Bearer ";

  private final JwtDecoder jwtDecoder;
  private final AccountRepository accountRepository;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain)
      throws ServletException, IOException {
    extractToken(request)
        .ifPresent(
            token -> {
              try {
                Jwt jwt = jwtDecoder.decode(token);
                UUID accountId = UUID.fromString(jwt.getSubject());
                accountRepository
                    .findById(accountId)
                    .ifPresent(
                        account -> {
                          AccountUserDetails userDetails = new AccountUserDetails(account);
                          var authentication =
                              new UsernamePasswordAuthenticationToken(
                                  userDetails, null, userDetails.getAuthorities());
                          SecurityContextHolder.getContext().setAuthentication(authentication);
                        });
              } catch (JwtException | IllegalArgumentException ignored) {
                SecurityContextHolder.clearContext();
              }
            });

    filterChain.doFilter(request, response);
  }

  private Optional<String> extractToken(HttpServletRequest request) {
    String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (authorization == null || !authorization.startsWith(BEARER_PREFIX)) {
      return Optional.empty();
    }
    String token = authorization.substring(BEARER_PREFIX.length()).trim();
    return token.isEmpty() ? Optional.empty() : Optional.of(token);
  }
}
