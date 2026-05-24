package com.example.pice.service;

import com.google.cloud.spring.pubsub.core.PubSubTemplate;
import org.springframework.stereotype.Service;

@Service
public class PubSubProducerService {

    private final PubSubTemplate pubSubTemplate;
    private static final String TOPIC_NAME = "analyze-statement-topic";

    public PubSubProducerService(PubSubTemplate pubSubTemplate) {
        this.pubSubTemplate = pubSubTemplate;
    }

    public void dispatchToQueue(String documentId) {
        pubSubTemplate.publish(TOPIC_NAME, documentId);
        System.out.println("Dispatched document " + documentId + " to topic " + TOPIC_NAME);
    }
}
