package com.infy.budgetMS.repository;

import com.infy.budgetMS.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByMonthYear(String monthYear);
    List<Budget> findByCategoryAndMonthYear(String category, String monthYear);
    List<Budget> findByCategory(String category);
}
