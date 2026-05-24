package com.example.pice.controller;

import com.example.pice.service.DatabaseService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StatementController {

    private final DatabaseService databaseService;

    public StatementController(DatabaseService databaseService) {

        this.databaseService = databaseService;
    }
    
    @GetMapping("/api/status/{id}")
    public String getStatus(@PathVariable String id) {
        return databaseService.getDocumentById(id).getStatus();
    }
}
