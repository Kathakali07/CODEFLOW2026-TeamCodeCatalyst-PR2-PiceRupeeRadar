package com.pae.api_service.service;

import com.google.cloud.spring.pubsub.core.PubSubTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PubSubProducerService {

    private static final String TOPIC_NAME = "analyze-statement-topic";

    @Autowired
    private PubSubTemplate pubSubTemplate;

    public void dispatchToQueue(String documentId) {
        // Publishes the Firestore Document ID to the Pub/Sub topic so the Python consumer wakes up
        pubSubTemplate.publish(TOPIC_NAME, documentId);
        System.out.println("Published Document ID to Pub/Sub: " + documentId);
    }
}
