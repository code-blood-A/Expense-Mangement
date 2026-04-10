package com.infy.budgetMS.controller;

import com.infy.budgetMS.entity.Budget;
import com.infy.budgetMS.repository.BudgetRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetRepository budgetRepository;

    public BudgetController(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    @PostMapping
    public ResponseEntity<Budget> setBudget(@RequestBody Budget request) {
        Budget budget = new Budget(request.getCategory(), request.getMonthYear(), request.getLimitAmount());
        return ResponseEntity.ok(budgetRepository.save(budget));
    }

    @GetMapping
    public ResponseEntity<java.util.List<Budget>> getBudgets(
            @RequestParam(required = false) String monthYear,
            @RequestParam(required = false) String category) {

        if (monthYear != null && category != null) {
            return ResponseEntity.ok(budgetRepository.findByCategoryAndMonthYear(category, monthYear));
        } else if (monthYear != null) {
            return ResponseEntity.ok(budgetRepository.findByMonthYear(monthYear));
        } else if (category != null) {
            return ResponseEntity.ok(budgetRepository.findByCategory(category));
        } else {
            return ResponseEntity.ok(budgetRepository.findAll());
        }
    }
}


        