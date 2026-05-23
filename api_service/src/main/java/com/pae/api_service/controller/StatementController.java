package com.pae.api_service.controller;

import com.pae.api_service.model.StatementDocument;
import com.pae.api_service.model.Transaction;
import com.pae.api_service.service.CsvParsingService;
import com.pae.api_service.service.FirestoreService;
import com.pae.api_service.service.PubSubProducerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/statements")
@CrossOrigin(origins = "*") // Allow frontend to call these endpoints
public class StatementController {

    @Autowired
    private CsvParsingService csvParsingService;

    @Autowired
    private FirestoreService firestoreService;

    @Autowired
    private PubSubProducerService pubSubProducerService;

    // 1. Upload CSV, parse, mask PII, save to DB, and publish to PubSub
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadStatement(@RequestParam("file") MultipartFile file) {
        try {
            // 1. Parse & Sanitize
            List<Transaction> transactions = csvParsingService.parseAndSanitize(file);
            
            // 2. Build Document
            String docId = "doc_" + UUID.randomUUID().toString();
            StatementDocument document = new StatementDocument();
            document.setId(docId);
            document.setUserId("user_" + UUID.randomUUID().toString().substring(0, 8)); // Mock User ID
            document.setStatus("PROCESSING");
            document.setTransactions(transactions);
            
            // 3. Save to Firestore
            firestoreService.saveStatement(document);
            
            // 4. Send ID to Python ML Queue
            pubSubProducerService.dispatchToQueue(docId);
            
            Map<String, String> response = new HashMap<>();
            response.put("documentId", docId);
            response.put("message", "File uploaded and sent for ML analysis!");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // 2. Status Polling Endpoint for Frontend
    @GetMapping("/status/{id}")
    public ResponseEntity<Map<String, String>> getStatus(@PathVariable String id) {
        try {
            StatementDocument doc = firestoreService.getStatement(id);
            if (doc == null) {
                return ResponseEntity.notFound().build();
            }
            Map<String, String> response = new HashMap<>();
            response.put("status", doc.getStatus());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 3. Get Full Completed Document for Dashboard
    @GetMapping("/{id}")
    public ResponseEntity<StatementDocument> getDocument(@PathVariable String id) {
        try {
            StatementDocument doc = firestoreService.getStatement(id);
            if (doc != null) {
                return ResponseEntity.ok(doc);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
