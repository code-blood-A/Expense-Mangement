package com.infy.budgetMS.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category; // Optional. If null, it means 'overall' budget
    
    private String monthYear; // Format: "yyyy-MM"
    
    private Double limitAmount;
    
    private Double currentSpend;

    public Budget() {
    }

    public Budget(String category, String monthYear, Double limitAmount) {
        this.category = category;
        this.monthYear = monthYear;
        this.limitAmount = limitAmount;
        this.currentSpend = 0.0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Double getLimitAmount() {
        return limitAmount;
    }

    public void setLimitAmount(Double limitAmount) {
        this.limitAmount = limitAmount;
    }

    public Double getCurrentSpend() {
        return currentSpend;
    }

    public void setCurrentSpend(Double currentSpend) {
        this.currentSpend = currentSpend;
    }
}
