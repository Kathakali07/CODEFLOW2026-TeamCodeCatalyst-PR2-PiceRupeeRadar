package com.example.pice.service;

import com.example.pice.model.StatementDocument;
import org.springframework.stereotype.Service;

@Service
public class DatabaseService {

    /**
     * Simulates fetching a document from Firestore.
     * The actual implementation will be handled separately.
     */
    public StatementDocument getDocumentById(String id) {
        StatementDocument document = new StatementDocument();
        document.set_id(id);
        document.setStatus("PROCESSING");
        return document;
    }
}
