package com.mello.steamcard.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthCheckAPI {

    @GetMapping("/health")
    public String healthCheck() {
        return "{\"status\":\"OK\"}";
    }
}