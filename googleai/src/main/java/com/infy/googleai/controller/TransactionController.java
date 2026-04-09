package com.infy.googleai.controller;

import com.infy.googleai.dto.CategoryResponse;
import com.infy.googleai.dto.TransactionRequest;
import com.infy.googleai.service.TransactionCategorizationService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionCategorizationService service;

    public TransactionController(TransactionCategorizationService service) {
        this.service = service;
    }

    @PostMapping("/categorize")
    public CategoryResponse categorizeTransaction(@RequestBody TransactionRequest request) {
        String category = service.categorizeTransaction(request.description());
        return new CategoryResponse(category);
    }
}
