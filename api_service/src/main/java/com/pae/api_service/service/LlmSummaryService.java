package com.pae.api_service.service;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class LlmSummaryService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateFinancialAdvice(Map<String, Object> summaryMetrics) {
        if (summaryMetrics == null || summaryMetrics.isEmpty()) {
            return "Unable to generate advice due to missing data.";
        }

        try {
            double income = ((Number) summaryMetrics.getOrDefault("totalIncome", 0.0)).doubleValue();
            double expense = ((Number) summaryMetrics.getOrDefault("totalExpense", 0.0)).doubleValue();
            String highestCategory = (String) summaryMetrics.getOrDefault("highestCategory", "None");

            String prompt = String.format("You are a professional, empathetic, and highly analytical financial advisor for a premium FinTech app. " +
                    "Your client has a total monthly income of ₹%,.2f and total expenses of ₹%,.2f. " +
                    "Their highest spending category is '%s'. " +
                    "Write a 2-3 sentence personalized financial recommendation that is encouraging, insightful, and professional. " +
                    "Do not use markdown, and ensure the tone is suitable for a professional banking application.", 
                    income, expense, highestCategory);

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", Collections.singletonList(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String url = GEMINI_API_URL + geminiApiKey;
            String responseJson = restTemplate.postForObject(url, entity, String.class);

            JsonNode root = objectMapper.readTree(responseJson);
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText().trim();

        } catch (Exception e) {
            e.printStackTrace();
            return "AI Advisor is currently analyzing your data. Please check back later.";
        }
    }
}
