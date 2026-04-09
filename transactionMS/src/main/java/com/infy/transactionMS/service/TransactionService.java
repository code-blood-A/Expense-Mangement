package com.infy.transactionMS.service;

import com.infy.transactionMS.dto.PaymentRequest;
import com.infy.transactionMS.entity.PaymentStatus;
import com.infy.transactionMS.entity.Transaction;
import com.infy.transactionMS.repository.TransactionRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final GoogleAiServiceClient aiServiceClient;

    public TransactionService(TransactionRepository transactionRepository, GoogleAiServiceClient aiServiceClient) {
        this.transactionRepository = transactionRepository;
        this.aiServiceClient = aiServiceClient;
    }

    public Transaction processPayment(PaymentRequest request) {
        String category = request.getCategory();

        // If category is not provided manually, trigger AI to fill it
        if (category == null || category.trim().isEmpty()) {
            category = aiServiceClient.categorizeTransaction(request.getDescription(), request.getAmount());
        }

        Transaction transaction = new Transaction(
                request.getMerchantName(),
                request.getDescription(),
                request.getAmount(),
                category,
                PaymentStatus.SUCCESS // assuming simple successful payment for now
        );

        return transactionRepository.save(transaction);
    }

    public Transaction getTransactionDetails(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + id));
    }

    public List<Transaction> getTransactionHistory(Boolean weekly, Boolean monthly, Double amount, String category, String status) {
        Specification<Transaction> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (weekly != null && weekly) {
                LocalDateTime startOfWeek = LocalDateTime.now().minusDays(7);
                predicates.add(cb.greaterThanOrEqualTo(root.get("transactionDate"), startOfWeek));
            } else if (monthly != null && monthly) {
                LocalDateTime startOfMonth = LocalDateTime.now().minusDays(30);
                predicates.add(cb.greaterThanOrEqualTo(root.get("transactionDate"), startOfMonth));
            }

            if (amount != null) {
                predicates.add(cb.equal(root.get("amount"), amount));
            }

            if (category != null && !category.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("category")), category.toLowerCase()));
            }

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), PaymentStatus.valueOf(status.toUpperCase())));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return transactionRepository.findAll(spec);
    }
}
