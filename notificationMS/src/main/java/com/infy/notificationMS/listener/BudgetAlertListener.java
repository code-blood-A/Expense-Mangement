package com.infy.notificationMS.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infy.notificationMS.event.BudgetAlertEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
public class BudgetAlertListener {

    private static final int MAX_ALERTS = 50;

    private final ObjectMapper objectMapper;
    // Thread-safe in-memory cache so the REST controller can read it
    private final Deque<BudgetAlertEvent> recentAlerts = new ConcurrentLinkedDeque<>();

    public BudgetAlertListener(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "budget-alerts", groupId = "notification-consumer-group")
    public void handleBudgetAlert(String message) {
        try {
            BudgetAlertEvent event = objectMapper.readValue(message, BudgetAlertEvent.class);
            event.setReceivedAt(Instant.now().toString());

            // Store, capping at MAX_ALERTS
            recentAlerts.addFirst(event);
            if (recentAlerts.size() > MAX_ALERTS) {
                recentAlerts.removeLast();
            }

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

    /** Returns a snapshot of recent alerts, newest first. */
    public List<BudgetAlertEvent> getRecentAlerts() {
        return Collections.unmodifiableList(new ArrayList<>(recentAlerts));
    }
}
