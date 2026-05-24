package com.pae.api_service.model;

import java.util.List;
import java.util.Map;

public class StatementDocument {
    private String id;
    private String userId;
    private String status;
    private String statementMonth;
    private Map<String, Object> summaryMetrics;
    private List<Transaction> transactions;
    private String aiSummary;

    public StatementDocument() {}

    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStatementMonth() { return statementMonth; }
    public void setStatementMonth(String statementMonth) { this.statementMonth = statementMonth; }

    public Map<String, Object> getSummaryMetrics() { return summaryMetrics; }
    public void setSummaryMetrics(Map<String, Object> summaryMetrics) { this.summaryMetrics = summaryMetrics; }

    public List<Transaction> getTransactions() { return transactions; }
    public void setTransactions(List<Transaction> transactions) { this.transactions = transactions; }

    // Dynamically computed for the frontend, but NOT saved to the database (Zero Redundancy!)
    @com.google.cloud.firestore.annotation.Exclude
    public List<Transaction> getAnomalousTransactions() {
        if (transactions == null) return null;
        return transactions.stream()
                .filter(t -> t.getMlData() != null && Boolean.TRUE.equals(t.getMlData().get("isAnomaly")))
                .toList();
    }

    @com.google.cloud.firestore.annotation.Exclude
    public List<Transaction> getRecurringTransactions() {
        if (transactions == null) return null;
        return transactions.stream()
                .filter(t -> t.getMlData() != null && Boolean.TRUE.equals(t.getMlData().get("isRecurring")))
                .toList();
    }

    @com.google.cloud.firestore.annotation.Exclude
    public Map<String, List<Transaction>> getExpenseBreakdownTransactions() {
        if (transactions == null) return null;
        return transactions.stream()
                .filter(t -> t.getMlData() != null && t.getMlData().get("predictedCategory") != null)
                .collect(java.util.stream.Collectors.groupingBy(t -> (String) t.getMlData().get("predictedCategory")));
    }
}
