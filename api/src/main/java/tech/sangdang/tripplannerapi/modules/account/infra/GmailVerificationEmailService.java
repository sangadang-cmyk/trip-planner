package tech.sangdang.tripplannerapi.modules.account.infra;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import tech.sangdang.tripplannerapi.config.properties.GmailMailProperties;
import tech.sangdang.tripplannerapi.modules.account.domain.port.VerificationEmailService;

@Service
@RequiredArgsConstructor
public class GmailVerificationEmailService implements VerificationEmailService {
  private final JavaMailSender mailSender;
  private final GmailMailProperties gmailMailProperties;

  @Override
  public void sendVerificationEmail(String toEmail, String verificationCode) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(gmailMailProperties.from());
    message.setTo(toEmail);
    message.setSubject("Verify your Trip Planner account");
    message.setText(
        "Use this verification code to complete your registration: "
            + verificationCode
            + "\n\nThis code will expire once you verify your email.");
    mailSender.send(message);
  }
}
