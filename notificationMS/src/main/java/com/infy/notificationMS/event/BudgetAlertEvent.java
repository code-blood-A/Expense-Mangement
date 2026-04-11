package com.infy.notificationMS.event;

public class BudgetAlertEvent {
    private String category;
    private String monthYear;
    private Double limitAmount;
    private Double currentSpend;
    private String receivedAt;

    public BudgetAlertEvent() {}

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getMonthYear() { return monthYear; }
    public void setMonthYear(String monthYear) { this.monthYear = monthYear; }
    public Double getLimitAmount() { return limitAmount; }
    public void setLimitAmount(Double limitAmount) { this.limitAmount = limitAmount; }
    public Double getCurrentSpend() { return currentSpend; }
    public void setCurrentSpend(Double currentSpend) { this.currentSpend = currentSpend; }
    public String getReceivedAt() { return receivedAt; }
    public void setReceivedAt(String receivedAt) { this.receivedAt = receivedAt; }
}
