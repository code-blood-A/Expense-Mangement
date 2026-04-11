package com.infy.notificationMS.controller;

import com.infy.notificationMS.event.BudgetAlertEvent;
import com.infy.notificationMS.listener.BudgetAlertListener;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final BudgetAlertListener budgetAlertListener;

    public NotificationController(BudgetAlertListener budgetAlertListener) {
        this.budgetAlertListener = budgetAlertListener;
    }

    /**
     * Returns the most recent budget alert notifications (newest first).
     * The frontend polls this endpoint to populate the Notification Center.
     */
    @GetMapping
    public ResponseEntity<List<BudgetAlertEvent>> getNotifications() {
        return ResponseEntity.ok(budgetAlertListener.getRecentAlerts());
    }
}
