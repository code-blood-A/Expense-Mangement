package com.infy.transactionMS.dto;

public class TransactionRequest {
    private String description;
    private Double amount;
    private String merchantName;

    public TransactionRequest() {
    }

    public TransactionRequest(String description, Double amount, String merchantName) {
        this.description = description;
        this.amount = amount;
        this.merchantName = merchantName;
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

    public String getMerchantName() {
        return merchantName;
    }

    public void setMerchantName(String merchantName) {
        this.merchantName = merchantName;
    }
}

