package com.infy.budgetMS.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infy.budgetMS.entity.Budget;
import com.infy.budgetMS.event.BudgetAlertEvent;
import com.infy.budgetMS.event.TransactionEvent;
import com.infy.budgetMS.repository.BudgetRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionEventListener {

    private final BudgetRepository budgetRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public TransactionEventListener(BudgetRepository budgetRepository, KafkaTemplate<String, Object> kafkaTemplate, ObjectMapper objectMapper) {
        this.budgetRepository = budgetRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "transaction-events", groupId = "budget-consumer-group")
    public void handleTransactionEvent(String message) {
        try {
            TransactionEvent event = objectMapper.readValue(message, TransactionEvent.class);
            System.out.println("BudgetMS received transaction: " + event.getAmount() + " for " + event.getCategory());

            // 1. Process Overall Budgets
            List<Budget> overallBudgets = budgetRepository.findByCategoryAndMonthYear(null, event.getMonthYear());
            processBudgets(overallBudgets, event.getAmount());

            // 2. Process Specific Category Budgets
            if (event.getCategory() != null) {
                List<Budget> categoryBudgets = budgetRepository.findByCategoryAndMonthYear(event.getCategory(), event.getMonthYear());
                processBudgets(categoryBudgets, event.getAmount());
            }
        } catch (Exception e) {
            System.err.println("Error processing transaction event: " + e.getMessage());
        }
    }

    private void processBudgets(List<Budget> budgets, Double amount) {
        for (Budget budget : budgets) {
            budget.setCurrentSpend(budget.getCurrentSpend() + amount);
            budgetRepository.save(budget);

            if (budget.getCurrentSpend() >= (0.9 * budget.getLimitAmount())) {
                System.out.println("Budget limit 90% breached! Publishing alert...");
                BudgetAlertEvent alert = new BudgetAlertEvent(
                        budget.getCategory() == null ? "OVERALL" : budget.getCategory(),
                        budget.getMonthYear(),
                        budget.getLimitAmount(),
                        budget.getCurrentSpend()
                );
                try {
                    kafkaTemplate.send("budget-alerts", objectMapper.writeValueAsString(alert));
                } catch(Exception e) {
                     System.err.println("Failed to send budget alert: " + e.getMessage());
                }
            }
        }
    }
}
