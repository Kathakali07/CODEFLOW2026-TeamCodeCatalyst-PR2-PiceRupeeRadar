package com.pae.api_service.controller;

import com.pae.api_service.model.StatementDocument;
import com.pae.api_service.model.Transaction;
import com.pae.api_service.service.CsvParsingService;
import com.pae.api_service.service.FirestoreService;
import com.pae.api_service.service.PubSubProducerService;
import com.pae.api_service.service.LlmSummaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/statements")
public class StatementController {

    @Autowired
    private CsvParsingService csvParsingService;

    @Autowired
    private com.pae.api_service.service.PdfParsingService pdfParsingService;

    @Autowired
    private FirestoreService firestoreService;

    @Autowired
    private PubSubProducerService pubSubProducerService;
    
    @Autowired
    private LlmSummaryService llmSummaryService;

    // 1. Upload Document (Asynchronous Processing)
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadStatement(
            @RequestParam("file") MultipartFile file, 
            @RequestParam(value = "statementMonth", required = false) String statementMonth,
            jakarta.servlet.http.HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // Read bytes immediately while the request stream is still open
            final byte[] fileBytes = file.getBytes();
            final String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
            final String contentType = file.getContentType();

            // 1. Build Initial Document
            String docId = "doc_" + UUID.randomUUID().toString();
            StatementDocument document = new StatementDocument();
            document.setId(docId);
            document.setUserId(userId); // Dynamic User ID from JWT
            document.setStatus("EXTRACTING_PDF"); // Initial state for Async pipeline
            document.setStatementMonth(statementMonth != null ? statementMonth : "Unknown");
            
            // 2. Save Initial Document to Firestore
            firestoreService.saveStatement(document);
            
            // 3. Kick off Async Background Processing
            java.util.concurrent.CompletableFuture.runAsync(() -> {
                try {
                    List<Transaction> transactions;
                    if (fileName.endsWith(".pdf") || "application/pdf".equals(contentType)) {
                        transactions = pdfParsingService.parseAndSanitize(fileBytes);
                    } else {
                        transactions = csvParsingService.parseAndSanitize(fileBytes);
                    }
                    
                    // Update document
                    document.setTransactions(transactions);
                    document.setStatus("PROCESSING"); // Ready for Python ML
                    
                    // Save and Ping Pub/Sub
                    firestoreService.saveStatement(document);
                    pubSubProducerService.dispatchToQueue(docId);
                    
                } catch (Exception e) {
                    e.printStackTrace();
                    document.setStatus("FAILED");
                    try {
                        firestoreService.saveStatement(document);
                    } catch (Exception ex) {
                        ex.printStackTrace();
                    }
                }
            });
            
            // 4. Return immediately to the frontend!
            Map<String, String> response = new HashMap<>();
            response.put("documentId", docId);
            response.put("message", "File upload received. Extracting data in the background!");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // 2. Status Polling Endpoint for Frontend (Now with AI Summary!)
    @GetMapping("/status/{id}")
    public ResponseEntity<?> getStatus(@PathVariable String id) {
        try {
            StatementDocument document = firestoreService.getStatement(id);
            if (document == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Document not found");
            }
            
            // Basic response
            Map<String, Object> response = new HashMap<>();
            response.put("status", document.getStatus());
            
            // If completed, fetch the summary metrics and attach an AI advisor summary!
            if ("COMPLETED".equals(document.getStatus())) {
                // Fetch the actual document data directly from Firestore to ensure we have summaryMetrics map
                var docSnapshot = com.google.cloud.firestore.FirestoreOptions.getDefaultInstance().toBuilder()
                    .setProjectId("fintech-hackathon")
                    .setEmulatorHost("127.0.0.1:8080")
                    .build()
                    .getService()
                    .collection("statements")
                    .document(id)
                    .get()
                    .get();
                    
                if (docSnapshot.exists() && docSnapshot.contains("summaryMetrics")) {
                    Map<String, Object> metrics = (Map<String, Object>) docSnapshot.get("summaryMetrics");
                    response.put("summaryMetrics", metrics);
                    response.put("aiSummary", llmSummaryService.generateFinancialAdvice(metrics));
                }
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving status");
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

    // 4. Get all statements for the logged-in user
    @GetMapping("/my-statements")
    public ResponseEntity<List<StatementDocument>> getMyStatements(jakarta.servlet.http.HttpServletRequest request) {
        try {
            String userId = (String) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            List<StatementDocument> docs = firestoreService.getStatementsByUserId(userId);
            return ResponseEntity.ok(docs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
