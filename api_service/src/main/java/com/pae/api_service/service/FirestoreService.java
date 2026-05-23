package com.pae.api_service.service;

import com.google.cloud.firestore.Firestore;
import com.pae.api_service.model.StatementDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;

@Service
public class FirestoreService {

    private static final String COLLECTION_NAME = "statements";

    private Firestore firestore;

    public FirestoreService() {
        this.firestore = com.google.cloud.firestore.FirestoreOptions.getDefaultInstance().toBuilder()
            .setProjectId("fintech-hackathon")
            .setEmulatorHost("127.0.0.1:8080")
            .build()
            .getService();
    }

    public void saveStatement(StatementDocument document) throws ExecutionException, InterruptedException {
        // Asynchronously save the document to Firestore using a Map to avoid any serialization issues
        java.util.Map<String, Object> docData = new java.util.HashMap<>();
        docData.put("id", document.getId());
        docData.put("userId", document.getUserId());
        docData.put("status", document.getStatus());
        
        java.util.List<java.util.Map<String, Object>> txnList = new java.util.ArrayList<>();
        if (document.getTransactions() != null) {
            for (com.pae.api_service.model.Transaction txn : document.getTransactions()) {
                java.util.Map<String, Object> txnData = new java.util.HashMap<>();
                txnData.put("txnId", txn.getTxnId());
                txnData.put("date", txn.getDate());
                txnData.put("rawNarration", txn.getRawNarration());
                txnData.put("amount", txn.getAmount());
                txnData.put("type", txn.getType());
                txnList.add(txnData);
            }
        }
        docData.put("transactions", txnList);

        firestore.collection(COLLECTION_NAME).document(document.getId()).set(docData).get();
    }

    public StatementDocument getStatement(String documentId) throws ExecutionException, InterruptedException {
        var documentSnapshot = firestore.collection(COLLECTION_NAME).document(documentId).get().get();
        if (documentSnapshot.exists()) {
            return documentSnapshot.toObject(StatementDocument.class);
        }
        return null;
    }
}
