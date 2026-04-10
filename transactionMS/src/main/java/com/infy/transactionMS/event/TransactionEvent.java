package com.infy.transactionMS.event;

public class TransactionEvent {
    private Long transactionId;
    private Double amount;
    private String category;
    private String monthYear; // To make it easier for budget listening

    public TransactionEvent() {
    }

    public TransactionEvent(Long transactionId, Double amount, String category, String monthYear) {
        this.transactionId = transactionId;
        this.amount = amount;
        this.category = category;
        this.monthYear = monthYear;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getMonthYear() {
        return monthYear;
    }

    public void setMonthYear(String monthYear) {
        this.monthYear = monthYear;
    }
}
