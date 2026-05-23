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
            String line = reader.readLine();
            
            if (line == null) {
                throw new IllegalArgumentException("The uploaded CSV file is empty.");
            }
            
            // Basic header validation
            String[] headers = line.split(",");
            if (headers.length < 4) {
                throw new IllegalArgumentException("Invalid CSV format. The file must contain at least 4 columns (Date, Narration, Amount, Type).");
            }
            
            while ((line = reader.readLine()) != null) {
                String[] columns = line.split(",");
                // Skip rows that don't match the expected minimum length
                if (columns.length < 4) continue; 
                
                String date = columns[0].trim();
                String rawNarration = columns[1].trim();
                double amount;
                try {
                    amount = Double.parseDouble(columns[2].trim());
                } catch (NumberFormatException e) {
                    continue; // Skip rows where amount is not a number
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
        
        if (transactions.isEmpty()) {
            throw new IllegalArgumentException("No valid transactions found in the CSV. Please ensure amounts are numbers and it follows standard layout.");
        }
        
        return transactions;
    }
    
    private String sanitizeNarration(String narration) {
        // Replace all but last 4 digits of any account-number-like string with asterisks
        return ACCOUNT_NUM_PATTERN.matcher(narration).replaceAll("****$1");
    }
}
