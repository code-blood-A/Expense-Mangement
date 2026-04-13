package com.infy.transactionMS.service;

import com.infy.transactionMS.dto.CategoryResponse;
import com.infy.transactionMS.dto.TransactionRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GoogleAiServiceClient {

    private final RestTemplate restTemplate;

    // Use a configurable URL, defaulting to local setup
    @Value("${googleai.service.url:http://localhost:8080/api/transactions/categorize}")
    private String googleAiUrl;

    public GoogleAiServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String categorizeTransaction(String description, Double amount, String merchantName) {
        try {
            TransactionRequest request = new TransactionRequest(description, amount, merchantName);
            CategoryResponse response = restTemplate.postForObject(googleAiUrl, request, CategoryResponse.class);
            if (response != null && response.getCategory() != null) {
                return response.getCategory();
            }
        } catch (Exception e) {
            // Log error, fallback to un-categorized
            System.err.println("Error calling googleai service: " + e.getMessage());
        }
        return "MISCELLANEOUS";
    }
}

