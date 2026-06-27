package tech.sangdang.tripplannerapi.config;

import java.util.Properties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import tech.sangdang.tripplannerapi.config.properties.GmailMailProperties;

@Configuration
@EnableConfigurationProperties(GmailMailProperties.class)
public class MailConfig {
  @Bean
  JavaMailSender javaMailSender(GmailMailProperties gmailMailProperties) {
    JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
    mailSender.setHost("smtp.gmail.com");
    mailSender.setPort(587);
    mailSender.setUsername(gmailMailProperties.username());
    mailSender.setPassword(gmailMailProperties.appPassword());

    Properties props = mailSender.getJavaMailProperties();
    props.put("mail.transport.protocol", "smtp");
    props.put("mail.smtp.auth", "true");
    props.put("mail.smtp.starttls.enable", "true");

    return mailSender;
  }
}
