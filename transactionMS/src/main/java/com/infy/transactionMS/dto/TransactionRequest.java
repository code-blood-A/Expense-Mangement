package com.infy.transactionMS.dto;

public class TransactionRequest {
    private String description;
    private Double amount;

    public TransactionRequest() {
    }

    public TransactionRequest(String description, Double amount) {
        this.description = description;
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}
