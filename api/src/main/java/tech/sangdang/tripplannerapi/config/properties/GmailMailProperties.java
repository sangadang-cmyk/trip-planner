package tech.sangdang.tripplannerapi.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.mail.gmail")
public record GmailMailProperties(String username, String appPassword, String from) {}
