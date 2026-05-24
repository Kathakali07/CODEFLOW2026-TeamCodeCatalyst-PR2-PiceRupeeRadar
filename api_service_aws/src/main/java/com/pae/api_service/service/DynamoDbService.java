package com.pae.api_service.service;

import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import com.pae.api_service.model.StatementDocument;
import com.pae.api_service.model.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DynamoDbService {

    private static final String TABLE_NAME = "statements";
    private static final String USER_TABLE_NAME = "users";
    private final DynamoDbTable<StatementDocument> statementTable;
    private final DynamoDbTable<User> userTable;

    public DynamoDbService(DynamoDbClient dynamoDbClient) {
        DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();
                
        this.statementTable = enhancedClient.table(TABLE_NAME, TableSchema.fromBean(StatementDocument.class));
        this.userTable = enhancedClient.table(USER_TABLE_NAME, TableSchema.fromBean(User.class));
        
        // Ensure tables exist
        try {
            statementTable.createTable();
            System.out.println("Created DynamoDB table: " + TABLE_NAME);
        } catch (Exception e) {}
        try {
            userTable.createTable();
            System.out.println("Created DynamoDB table: " + USER_TABLE_NAME);
        } catch (Exception e) {}
    }

    public void saveUser(User user) {
        userTable.putItem(user);
    }

    public User getUserByEmail(String email) {
        // Simple scan for hackathon
        for (User u : userTable.scan().items()) {
            if (email.equals(u.getEmail())) return u;
        }
        return null;
    }

    public void saveStatement(StatementDocument document) {
        statementTable.putItem(document);
    }

    public StatementDocument getStatement(String documentId) {
        return statementTable.getItem(r -> r.key(k -> k.partitionValue(documentId)));
    }

    public List<StatementDocument> getStatementsByUserId(String userId) {
        // For a hackathon, a simple scan with a filter is acceptable. 
        // For production, a GSI (Global Secondary Index) should be created.
        List<StatementDocument> results = new ArrayList<>();
        statementTable.scan().items().forEach(doc -> {
            if (userId.equals(doc.getUserId())) {
                results.add(doc);
            }
        });
        return results;
    }
}
