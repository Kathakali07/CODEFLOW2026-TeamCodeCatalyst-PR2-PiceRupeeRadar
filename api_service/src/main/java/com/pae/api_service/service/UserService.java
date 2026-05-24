package com.pae.api_service.service;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.pae.api_service.model.User;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class UserService {

    private static final String COLLECTION_NAME = "users";
    private Firestore firestore;

    public UserService() {
        this.firestore = com.google.cloud.firestore.FirestoreOptions.getDefaultInstance().toBuilder()
            .setProjectId("fintech-hackathon")
            .setEmulatorHost("127.0.0.1:8080")
            .build()
            .getService();
    }

    public User registerUser(String name, String email, String plainPassword) throws ExecutionException, InterruptedException {
        // Check if user already exists
        List<QueryDocumentSnapshot> docs = firestore.collection(COLLECTION_NAME).whereEqualTo("email", email).get().get().getDocuments();
        if (!docs.isEmpty()) {
            throw new IllegalArgumentException("Email already in use");
        }

        // Create new user
        String userId = "user_" + UUID.randomUUID().toString().substring(0, 8);
        String hashedPw = BCrypt.hashpw(plainPassword, BCrypt.gensalt(10));
        
        User newUser = new User(userId, name, email, hashedPw);
        firestore.collection(COLLECTION_NAME).document(userId).set(newUser).get();
        return newUser;
    }

    public User authenticateUser(String email, String plainPassword) throws ExecutionException, InterruptedException {
        List<QueryDocumentSnapshot> docs = firestore.collection(COLLECTION_NAME).whereEqualTo("email", email).get().get().getDocuments();
        if (docs.isEmpty()) {
            return null; // User not found
        }
        
        User user = docs.get(0).toObject(User.class);
        if (BCrypt.checkpw(plainPassword, user.getPasswordHash())) {
            return user;
        }
        return null; // Invalid password
    }
}
