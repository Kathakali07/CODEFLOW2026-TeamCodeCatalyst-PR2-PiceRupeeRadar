package com.pae.api_service;

import com.google.cloud.firestore.Firestore;
import com.pae.api_service.service.FirestoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

//@Component
public class TestSaveAndRead implements CommandLineRunner {

    @Autowired
    private Firestore firestore;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("====== TEST SAVE AND READ STARTED ======");
        
        Firestore localFirestore = com.google.cloud.firestore.FirestoreOptions.getDefaultInstance().toBuilder()
            .setProjectId("fintech-hackathon")
            .setEmulatorHost("127.0.0.1:8080")
            .build()
            .getService();

        System.out.println("Firestore Options Project ID: " + localFirestore.getOptions().getProjectId());
        System.out.println("Firestore Options Host: " + localFirestore.getOptions().getHost());
        
        Map<String, Object> testData = new HashMap<>();
        testData.put("status", "TESTING");
        
        System.out.println("Saving TEST_DOC to Firestore...");
        localFirestore.collection("statements").document("TEST_DOC").set(testData).get();
        System.out.println("Saved successfully!");

        System.out.println("Reading TEST_DOC back from Firestore...");
        var doc = localFirestore.collection("statements").document("TEST_DOC").get().get();
        if (doc.exists()) {
            System.out.println("SUCCESS: Document exists with data: " + doc.getData());
        } else {
            System.out.println("FAILURE: Document DOES NOT exist after saving!");
        }
        System.out.println("====== TEST SAVE AND READ FINISHED ======");
    }
}
