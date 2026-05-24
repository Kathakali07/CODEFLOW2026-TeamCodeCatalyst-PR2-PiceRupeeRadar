package com.pae.api_service.controller;

import com.pae.api_service.model.StatementDocument;
import com.pae.api_service.model.Transaction;
import com.pae.api_service.model.SummaryMetrics;
import com.pae.api_service.service.CsvParsingService;
import com.pae.api_service.service.DynamoDbService;
import com.pae.api_service.service.SqsProducerService;
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
    private DynamoDbService dynamoDbService;

    @Autowired
    private SqsProducerService sqsProducerService;

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

            final byte[] fileBytes = file.getBytes();
            final String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
            final String contentType = file.getContentType();

            // 1. Build Initial Document
            String docId = "doc_" + UUID.randomUUID().toString();
            StatementDocument document = new StatementDocument();
            document.setId(docId);
            document.setUserId(userId);
            document.setStatus("EXTRACTING_PDF");
            document.setStatementMonth(statementMonth != null ? statementMonth : "Unknown");
            
            // 2. Save Initial Document to DynamoDB
            dynamoDbService.saveStatement(document);
            
            // 3. Kick off Async Background Processing
            java.util.concurrent.CompletableFuture.runAsync(() -> {
                try {
                    if (fileName.endsWith(".pdf") || "application/pdf".equals(contentType)) {
                        String rawText = pdfParsingService.parseAndSanitize(fileBytes);
                        document.setRawText(rawText);
                    } else {
                        List<Transaction> transactions = csvParsingService.parseAndSanitize(fileBytes);
                        document.setTransactions(transactions);
                    }
                    
                    document.setStatus("PROCESSING");
                    
                    dynamoDbService.saveStatement(document);
                    sqsProducerService.dispatchToQueue(docId);
                    
                } catch (Exception e) {
                    e.printStackTrace();
                    document.setStatus("FAILED");
                    dynamoDbService.saveStatement(document);
                }
            });
            
            Map<String, String> response = new HashMap<>();
            response.put("documentId", docId);
            response.put("message", "File upload received. Extracting data in the background!");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // 2. Status Polling Endpoint for Frontend
    @GetMapping("/status/{id}")
    public ResponseEntity<?> getStatus(@PathVariable String id) {
        try {
            StatementDocument document = dynamoDbService.getStatement(id);
            if (document == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Document not found");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", document.getStatus());
            
            if ("COMPLETED".equals(document.getStatus())) {
                SummaryMetrics metrics = document.getSummaryMetrics();
                if (metrics != null) {
                    response.put("summaryMetrics", metrics);
                    
                    String aiSummary = document.getAiSummary();
                    if (aiSummary != null && !aiSummary.isEmpty()) {
                        response.put("aiSummary", aiSummary);
                    }
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
            StatementDocument doc = dynamoDbService.getStatement(id);
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
            List<StatementDocument> docs = dynamoDbService.getStatementsByUserId(userId);
            return ResponseEntity.ok(docs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
