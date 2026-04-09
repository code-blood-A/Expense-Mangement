package com.infy.userMs.controller;

import com.infy.userMs.dto.UpiValidationRequest;
import com.infy.userMs.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/users")
public class InternalUserController {

    @Autowired
    private AuthService authService;

    @PostMapping("/validate-upi")
    public ResponseEntity<Boolean> validateUpi(@Valid @RequestBody UpiValidationRequest request) {
        boolean isValid = authService.validateUpi(request.getUsername(), request.getUpiPassword());
        return ResponseEntity.ok(isValid);
    }
}
