package com.pae.api_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthInterceptor implements HandlerInterceptor {

    // In production, this should be an environment variable!
    // For the hackathon, we hardcode a 256-bit (32 byte) secure string.
    private static final String SECRET = "MySuperSecretFinTechHackathonKey123!";
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        
        // Handle CORS Preflight Requests (Browsers send OPTIONS before POST/GET)
        if (request.getMethod().equalsIgnoreCase("OPTIONS")) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");

        // 1. Check if token exists
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Missing or Invalid Authorization Header");
            return false;
        }

        String token = authHeader.substring(7); // Remove "Bearer "

        try {
            // 2. Mathematically Verify the Signature using our Secret Key
            // If the token was forged, or signed with a different key, this throws an exception.
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            // (Optional) You can attach the user ID from the claims to the request here!
            request.setAttribute("userId", claims.getSubject());
            return true;
            
        } catch (Exception e) {
            // 3. Token is invalid or expired
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Invalid or Expired JWT Token");
            return false;
        }
    }
}
