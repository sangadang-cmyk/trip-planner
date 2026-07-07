package tech.sangdang.tripplannerapi.modules.account.domain.port;

public interface VerificationEmailService {
  void sendVerificationEmail(String toEmail, String verificationCode);
}
