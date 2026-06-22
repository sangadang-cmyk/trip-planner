package tech.sangdang.tripplannerapi.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import tech.sangdang.tripplannerapi.config.properties.PendingRegistrationProperties;

@Configuration
@EnableScheduling
@EnableConfigurationProperties(PendingRegistrationProperties.class)
public class SchedulingConfig {}
