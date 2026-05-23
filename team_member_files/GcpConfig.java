package com.example.pice.config;

import com.google.api.gax.core.CredentialsProvider;
import com.google.api.gax.core.NoCredentialsProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class GcpConfig {

    /**
     * This creates a dummy credentials provider so that Spring Boot doesn't
     * crash looking for real Google Cloud credentials during local development.
     */
    @Bean
    @Primary
    public CredentialsProvider googleCredentials() {
        return NoCredentialsProvider.create();
    }
}
