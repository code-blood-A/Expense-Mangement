package com.infy.transactionMS.controller;

import com.infy.transactionMS.dto.PaymentRequest;
import com.infy.transactionMS.entity.Transaction;
import com.infy.transactionMS.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/payment")
    public ResponseEntity<Transaction> makePayment(@RequestBody PaymentRequest request) {
        Transaction completedTransaction = transactionService.processPayment(request);
        return ResponseEntity.ok(completedTransaction);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Transaction>> getTransactionHistory(
            @RequestParam(required = false) Boolean weekly,
            @RequestParam(required = false) Boolean monthly,
            @RequestParam(required = false) Double amount,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        
        List<Transaction> transactions = transactionService.getTransactionHistory(weekly, monthly, amount, category, status);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionDetails(@PathVariable Long id) {
        Transaction transaction = transactionService.getTransactionDetails(id);
        return ResponseEntity.ok(transaction);
    }
}
