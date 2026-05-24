package com.pae.api_service.service;

import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.CreateQueueRequest;
import software.amazon.awssdk.services.sqs.model.QueueDoesNotExistException;
import org.springframework.stereotype.Service;

@Service
public class SqsProducerService {

    private final SqsClient sqsClient;
    private final String QUEUE_NAME = "analyze-statement-queue";
    private String queueUrl;

    public SqsProducerService(SqsClient sqsClient) {
        this.sqsClient = sqsClient;
        
        // Ensure queue exists in AWS
        try {
            this.queueUrl = sqsClient.getQueueUrl(b -> b.queueName(QUEUE_NAME)).queueUrl();
        } catch (QueueDoesNotExistException e) {
            this.queueUrl = sqsClient.createQueue(CreateQueueRequest.builder()
                    .queueName(QUEUE_NAME)
                    .build()).queueUrl();
            System.out.println("Created SQS Queue: " + QUEUE_NAME);
        }
    }

    public void dispatchToQueue(String documentId) {
        try {
            SendMessageRequest sendMsgRequest = SendMessageRequest.builder()
                .queueUrl(queueUrl)
                .messageBody(documentId)
                .build();
            sqsClient.sendMessage(sendMsgRequest);
            System.out.println("Dispatched to SQS: " + documentId);
        } catch (Exception e) {
            System.err.println("Error publishing to SQS: " + e.getMessage());
        }
    }
}
