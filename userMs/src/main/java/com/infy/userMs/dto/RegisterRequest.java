package com.infy.userMs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "UPI Password is required")
    @Size(min = 4, max = 6, message = "UPI Password must be 4 to 6 digits")
    private String upiPassword;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUpiPassword() {
        return upiPassword;
    }

    public void setUpiPassword(String upiPassword) {
        this.upiPassword = upiPassword;
    }
}
