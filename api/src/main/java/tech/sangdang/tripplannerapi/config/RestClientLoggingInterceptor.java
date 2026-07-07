package tech.sangdang.tripplannerapi.config;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.util.StreamUtils;

@Slf4j
@RequiredArgsConstructor
public class RestClientLoggingInterceptor implements ClientHttpRequestInterceptor {

  private static final int MAX_LOG_BODY_CHARS = 4_096;
  private static final Pattern API_KEY_PATTERN =
      Pattern.compile("([?&]apikey=)[^&]*", Pattern.CASE_INSENSITIVE);

  private final String clientName;

  @Override
  public ClientHttpResponse intercept(
      HttpRequest request, byte[] body, ClientHttpRequestExecution execution) throws IOException {
    logRequest(request, body);

    ClientHttpResponse response = execution.execute(request, body);
    byte[] responseBody = StreamUtils.copyToByteArray(response.getBody());
    logResponse(response, responseBody);

    return new BufferedClientHttpResponse(response, responseBody);
  }

  private void logRequest(HttpRequest request, byte[] body) {
    log.debug(
        "[{}] RestClient request: {} {}",
        clientName,
        request.getMethod(),
        sanitizeUri(request.getURI().toString()));
    log.trace("[{}] RestClient request headers: {}", clientName, request.getHeaders());

    if (body.length == 0) {
      log.trace("[{}] RestClient request body: <empty>", clientName);
      return;
    }

    log.trace(
        "[{}] RestClient request body: {}",
        clientName,
        truncate(new String(body, StandardCharsets.UTF_8)));
  }

  private void logResponse(ClientHttpResponse response, byte[] responseBody) throws IOException {
    log.debug(
        "[{}] RestClient response: {} {}",
        clientName,
        response.getStatusCode().value(),
        response.getStatusText());
    log.trace("[{}] RestClient response headers: {}", clientName, response.getHeaders());

    if (responseBody.length == 0) {
      log.debug("[{}] RestClient response body: <empty>", clientName);
      return;
    }

    String bodyText = new String(responseBody, StandardCharsets.UTF_8);
    log.debug("[{}] RestClient response body: {}", clientName, truncate(bodyText));
    log.trace("[{}] RestClient response body (full): {}", clientName, bodyText);
  }

  private String sanitizeUri(String uri) {
    return API_KEY_PATTERN.matcher(uri).replaceAll("$1***");
  }

  private String truncate(String value) {
    if (value.length() <= MAX_LOG_BODY_CHARS) {
      return value;
    }
    return value.substring(0, MAX_LOG_BODY_CHARS)
        + "... [truncated, totalChars="
        + value.length()
        + "]";
  }

  private static final class BufferedClientHttpResponse implements ClientHttpResponse {

    private final ClientHttpResponse delegate;
    private final byte[] body;

    private BufferedClientHttpResponse(ClientHttpResponse delegate, byte[] body) {
      this.delegate = delegate;
      this.body = body;
    }

    @Override
    public org.springframework.http.HttpStatusCode getStatusCode() throws IOException {
      return delegate.getStatusCode();
    }

    @Override
    public String getStatusText() throws IOException {
      return delegate.getStatusText();
    }

    @Override
    public void close() {
      delegate.close();
    }

    @Override
    public InputStream getBody() {
      return new ByteArrayInputStream(body);
    }

    @Override
    public HttpHeaders getHeaders() {
      return delegate.getHeaders();
    }
  }
}
