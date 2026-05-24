package com.pae.api_service.service;

import com.pae.api_service.model.User;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private DynamoDbService dynamoDbService;

    public User registerUser(String name, String email, String plainPassword) {
        User existing = dynamoDbService.getUserByEmail(email);
        if (existing != null) {
            throw new IllegalArgumentException("Email already in use");
        }

        String userId = "user_" + UUID.randomUUID().toString().substring(0, 8);
        String hashedPw = BCrypt.hashpw(plainPassword, BCrypt.gensalt(10));
        
        User newUser = new User(userId, name, email, hashedPw);
        dynamoDbService.saveUser(newUser);
        return newUser;
    }

    public User authenticateUser(String email, String plainPassword) {
        User user = dynamoDbService.getUserByEmail(email);
        if (user == null) {
            return null; // User not found
        }
        
        if (BCrypt.checkpw(plainPassword, user.getPasswordHash())) {
            return user;
        }
        return null; // Invalid password
    }
}
