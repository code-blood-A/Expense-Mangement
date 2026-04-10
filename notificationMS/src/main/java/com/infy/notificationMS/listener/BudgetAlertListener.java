package com.infy.notificationMS.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infy.notificationMS.event.BudgetAlertEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class BudgetAlertListener {

    private final ObjectMapper objectMapper;

    public BudgetAlertListener(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "budget-alerts", groupId = "notification-consumer-group")
    public void handleBudgetAlert(String message) {
        try {
            BudgetAlertEvent event = objectMapper.readValue(message, BudgetAlertEvent.class);
            System.out.println("=====================================================");
            System.out.println("🚨 NOTIFICATION ALERT: BUDGET LIMIT BREACHED 🚨");
            System.out.println("Category : " + event.getCategory());
            System.out.println("Period   : " + event.getMonthYear());
            System.out.println("Limit    : ₹" + event.getLimitAmount());
            System.out.println("Spent    : ₹" + event.getCurrentSpend());
            System.out.println("Warning  : You have exceeded 90% of your allocated budget!");
            System.out.println("=====================================================");
        } catch (Exception e) {
             System.err.println("Failed to read notification event: " + e.getMessage());
        }
    }
}
