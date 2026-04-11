package com.infy.analysisMS.repository;

import com.infy.analysisMS.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Finds total spend for a given month and year.
     */
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE YEAR(t.transactionDate) = :year AND MONTH(t.transactionDate) = :month AND t.status = 'SUCCESS'")
    Double findMonthlyTotal(@Param("year") int year, @Param("month") int month);

    /**
     * Groups spending by category for a specific month.
     */
    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE YEAR(t.transactionDate) = :year AND MONTH(t.transactionDate) = :month AND t.status = 'SUCCESS' GROUP BY t.category ORDER BY SUM(t.amount) DESC")
    List<Object[]> findSpendByCategory(@Param("year") int year, @Param("month") int month);

    /**
     * Retrieves monthly totals for a period of time.
     */
    @Query("SELECT YEAR(t.transactionDate), MONTH(t.transactionDate), SUM(t.amount) FROM Transaction t WHERE t.status = 'SUCCESS' GROUP BY YEAR(t.transactionDate), MONTH(t.transactionDate) ORDER BY YEAR(t.transactionDate) DESC, MONTH(t.transactionDate) DESC")
    List<Object[]> findMonthlyTrend();
}
