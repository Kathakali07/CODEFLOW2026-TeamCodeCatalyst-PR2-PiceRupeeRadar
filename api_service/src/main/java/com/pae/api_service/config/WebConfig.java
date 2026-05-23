package com.pae.api_service.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private RateLimitInterceptor rateLimitInterceptor;

    @Autowired
    private JwtAuthInterceptor jwtAuthInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 1. Security: Authenticate ALL endpoints under /api/statements
        registry.addInterceptor(jwtAuthInterceptor).addPathPatterns("/api/statements/**");
        
        // 2. Rate Limiting: Apply rate limiting specifically to the upload endpoint
        registry.addInterceptor(rateLimitInterceptor).addPathPatterns("/api/statements/upload");
    }
}
