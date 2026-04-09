package com.infy.userMs.dto;

import jakarta.validation.constraints.NotBlank;

public class UpiValidationRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "UPI Password is required")
    private String upiPassword;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUpiPassword() {
        return upiPassword;
    }

    public void setUpiPassword(String upiPassword) {
        this.upiPassword = upiPassword;
    }
}
