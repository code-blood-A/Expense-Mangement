package com.infy.transactionMS.dto;

public class PaymentRequest {

    private String merchantName;
    private String description;
    private Double amount;
    private String category;

    public PaymentRequest() {
    }

    public PaymentRequest(String merchantName, String description, Double amount, String category) {
        this.merchantName = merchantName;
        this.description = description;
        this.amount = amount;
        this.category = category;
    }

    public String getMerchantName() {
        return merchantName;
    }

    public void setMerchantName(String merchantName) {
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
