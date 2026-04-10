package com.infy.budgetMS.event;

public class BudgetAlertEvent {
    private String category;
    private String monthYear;
    private Double limitAmount;
    private Double currentSpend;

    public BudgetAlertEvent() {}
    public BudgetAlertEvent(String category, String monthYear, Double limitAmount, Double currentSpend) {
        this.category = category;
        this.monthYear = monthYear;
        this.limitAmount = limitAmount;
        this.currentSpend = currentSpend;
    }

    // Getters and Setters
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getMonthYear() { return monthYear; }
    public void setMonthYear(String monthYear) { this.monthYear = monthYear; }
    public Double getLimitAmount() { return limitAmount; }
    public void setLimitAmount(Double limitAmount) { this.limitAmount = limitAmount; }
    public Double getCurrentSpend() { return currentSpend; }
    public void setCurrentSpend(Double currentSpend) { this.currentSpend = currentSpend; }
}
