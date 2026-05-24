package com.pae.api_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String id; // Random UUID
    private String name;
    private String email;
    private String passwordHash; // BCrypt hash, never store plain text!
}
