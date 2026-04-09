package com.infy.transactionMS.dto;

public class CategoryResponse {
    private String category;

    public CategoryResponse() {
    }

    public CategoryResponse(String category) {
        this.category = category;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
