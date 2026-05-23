package com.pae.api_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pae.api_service.model.Transaction;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.regex.Pattern;

@Service
public class PdfParsingService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=";
    private static final Pattern ACCOUNT_NUM_PATTERN = Pattern.compile("\\b\\d{5,14}(\\d{4})\\b");
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Transaction> parseAndSanitize(MultipartFile file) throws Exception {
        // 1. Convert PDF to Base64
        String base64Pdf = Base64.getEncoder().encodeToString(file.getBytes());

        // 2. Build Gemini API Request
        String prompt = "You are a financial data extraction AI. Extract all bank transactions from this PDF (which may contain handwriting). " +
                "Return ONLY a strict JSON array of objects. Do not wrap it in markdown block quotes. Each object must have exactly these keys: " +
                "'date' (String, YYYY-MM-DD), 'rawNarration' (String), 'amount' (Number), 'type' (String, strictly 'CREDIT' or 'DEBIT'). " +
                "If it is an expense/withdrawal, it is a DEBIT. If it is an income/deposit, it is a CREDIT. " +
                "Do not include any explanation or extra text.";

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> inlineData = new HashMap<>();
        inlineData.put("mimeType", "application/pdf");
        inlineData.put("data", base64Pdf);

        Map<String, Object> dataPart = new HashMap<>();
        dataPart.put("inlineData", inlineData);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", Arrays.asList(textPart, dataPart));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(content));

        // 3. Make REST Call
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String url = GEMINI_API_URL + geminiApiKey;
        String responseJson = restTemplate.postForObject(url, entity, String.class);

        // 4. Parse Gemini Response
        JsonNode root = objectMapper.readTree(responseJson);
        String extractedText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        // Gemini sometimes wraps JSON in ```json ... ``` despite instructions. Clean it.
        extractedText = extractedText.replaceAll("^```json\\s*", "").replaceAll("\\s*```$", "").trim();

        JsonNode jsonArray = objectMapper.readTree(extractedText);
        if (!jsonArray.isArray()) {
            throw new IllegalArgumentException("Gemini failed to return a JSON array.");
        }

        // 5. Map to Transaction Objects and Sanitize PII
        List<Transaction> transactions = new ArrayList<>();
        for (JsonNode node : jsonArray) {
            String rawNarration = node.path("rawNarration").asText("");
            String safeNarration = sanitizeNarration(rawNarration);

            Transaction txn = new Transaction();
            txn.setTxnId(UUID.randomUUID().toString());
            txn.setDate(node.path("date").asText(""));
            txn.setRawNarration(safeNarration);
            txn.setAmount(node.path("amount").asDouble(0.0));
            txn.setType(node.path("type").asText("DEBIT"));

            transactions.add(txn);
        }

        if (transactions.isEmpty()) {
            throw new IllegalArgumentException("No transactions could be found in the PDF.");
        }

        return transactions;
    }

    private String sanitizeNarration(String narration) {
        return ACCOUNT_NUM_PATTERN.matcher(narration).replaceAll("****$1");
    }
}
