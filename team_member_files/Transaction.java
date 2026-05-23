package com.example.pice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    private String txnId;
    private String date;
    private String rawNarration;
    private double amount;
    private String type;
    private MlData mlData;
}
