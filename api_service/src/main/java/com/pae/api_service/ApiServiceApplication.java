package com.pae.api_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ApiServiceApplication {

    public static void main(String[] args) {
        // Force the core Google Cloud Java SDKs to use the local emulators!
        System.setProperty("FIRESTORE_EMULATOR_HOST", "localhost:8080");
        System.setProperty("PUBSUB_EMULATOR_HOST", "localhost:8085");
        
        SpringApplication.run(ApiServiceApplication.class, args);
    }

}
