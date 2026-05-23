package com.example.pice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatementDocument {
    private String _id;
    private String userId;
    private String status;
    private SummaryMetrics summaryMetrics;
    private List<Transaction> transactions;
}
