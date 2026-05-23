package com.pae.api_service.service;

import com.pae.api_service.model.Transaction;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class CsvParsingService {

    // Matches strings of 9-18 digits and captures the last 4. 
    // This handles masking Indian Bank account numbers.
    private static final Pattern ACCOUNT_NUM_PATTERN = Pattern.compile("\\b\\d{5,14}(\\d{4})\\b");
    
    public List<Transaction> parseAndSanitize(MultipartFile file) throws Exception {
        List<Transaction> transactions = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean firstLine = true;
            
            while ((line = reader.readLine()) != null) {
                if (firstLine) {
                    firstLine = false; // Skip CSV header
                    continue;
                }
                
                String[] columns = line.split(",");
                // Expecting standard format: Date, Narration, Amount, Type
                if (columns.length < 4) continue; 
                
                String date = columns[0].trim();
                String rawNarration = columns[1].trim();
                double amount;
                try {
                    amount = Double.parseDouble(columns[2].trim());
                } catch (NumberFormatException e) {
                    continue; // Skip invalid rows
                }
                String type = columns[3].trim().toUpperCase().contains("CR") ? "CREDIT" : "DEBIT";
                
                // Privacy-first: Sanitize the narration before it ever touches memory/DB
                String safeNarration = sanitizeNarration(rawNarration);
                
                Transaction txn = new Transaction();
                txn.setTxnId(UUID.randomUUID().toString());
                txn.setDate(date);
                txn.setRawNarration(safeNarration);
                txn.setAmount(amount);
                txn.setType(type);
                
                transactions.add(txn);
            }
        }
        
        return transactions;
    }
    
    private String sanitizeNarration(String narration) {
        // Replace all but last 4 digits of any account-number-like string with asterisks
        return ACCOUNT_NUM_PATTERN.matcher(narration).replaceAll("****$1");
    }
}
