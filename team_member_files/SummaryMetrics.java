package com.example.pice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SummaryMetrics {
    private double totalIncome;
    private double totalExpense;
    private String highestCategory;
}
