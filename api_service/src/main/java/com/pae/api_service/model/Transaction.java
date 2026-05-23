package com.pae.api_service.model;

import java.util.Map;

public class Transaction {
    private String txnId;
    private String date;
    private String rawNarration;
    private double amount;
    private String type;
    private Map<String, Object> mlData;

    public Transaction() {}

    public String getTxnId() { return txnId; }
    public void setTxnId(String txnId) { this.txnId = txnId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getRawNarration() { return rawNarration; }
    public void setRawNarration(String rawNarration) { this.rawNarration = rawNarration; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Map<String, Object> getMlData() { return mlData; }
    public void setMlData(Map<String, Object> mlData) { this.mlData = mlData; }
}
