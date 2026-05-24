package com.pae.api_service.controller;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
public class AuthTestController {

    // Must match the secret in JwtAuthInterceptor
    private static final String SECRET = "MySuperSecretFinTechHackathonKey123!";

    @GetMapping("/api/auth/test-token")
    public Map<String, String> generateTestToken() {
        String token = Jwts.builder()
                .setSubject("user_ind_9988") // Hardcoded user ID
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("message", "Attach this as 'Authorization: Bearer <token>' to test the API!");
        
        return response;
    }
}
