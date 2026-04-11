package com.infy.analysisMS.service;

import com.infy.analysisMS.client.GoogleAiClient;
import com.infy.analysisMS.dto.*;
import com.infy.analysisMS.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnalysisService {

    private final TransactionRepository repository;
    private final GoogleAiClient aiClient;

    public AnalysisService(TransactionRepository repository, GoogleAiClient aiClient) {
        this.repository = repository;
        this.aiClient = aiClient;
    }

    public MonthlySpendResponse getMonthlySpend(String monthYear) {
        LocalDate date = parseMonthYear(monthYear);
        Double total = repository.findMonthlyTotal(date.getYear(), date.getMonthValue());
        return new MonthlySpendResponse(monthYear, total != null ? total : 0.0);
    }

    public CategorySpendResponse getTopCategory(String monthYear) {
        LocalDate date = parseMonthYear(monthYear);
        List<Object[]> results = repository.findSpendByCategory(date.getYear(), date.getMonthValue());
        if (results.isEmpty()) return new CategorySpendResponse("None", 0.0);
        Object[] top = results.get(0);
        return new CategorySpendResponse((String) top[0], (Double) top[1]);
    }

    public List<MonthlyTrendResponse> getMonthlyTrend(int months) {
        List<Object[]> results = repository.findMonthlyTrend();
        return results.stream()
                .limit(months)
                .map(res -> new MonthlyTrendResponse(res[0] + "-" + String.format("%02d", res[1]), (Double) res[2]))
                .collect(Collectors.toList());
    }

    public ComparisonResponse compareMonths(String monthYear) {
        LocalDate current = parseMonthYear(monthYear);
        LocalDate previous = current.minusMonths(1);
        String prevStr = previous.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        Double currSpend = repository.findMonthlyTotal(current.getYear(), current.getMonthValue());
        Double prevSpend = repository.findMonthlyTotal(previous.getYear(), previous.getMonthValue());
        
        currSpend = currSpend != null ? currSpend : 0.0;
        prevSpend = prevSpend != null ? prevSpend : 0.0;

        double diff = currSpend - prevSpend;
        double pct = prevSpend > 0 ? (diff / prevSpend) * 100 : 0.0;
        String dir = diff >= 0 ? "UP" : "DOWN";

        return new ComparisonResponse(monthYear, prevStr, currSpend, prevSpend, String.format("%.1f %%", Math.abs(pct)), dir);
    }

    public InsightResponse generateInsight(String monthYear) {
        LocalDate date = parseMonthYear(monthYear);
        List<Object[]> categorySums = repository.findSpendByCategory(date.getYear(), date.getMonthValue());
        
        List<CategorySpendResponse> breakdown = categorySums.stream()
                .map(res -> new CategorySpendResponse((String) res[0], (Double) res[1]))
                .toList();

        Double total = breakdown.stream().mapToDouble(CategorySpendResponse::amount).sum();
        ComparisonResponse comp = compareMonths(monthYear);

        // Build summary for AI
        StringBuilder summary = new StringBuilder();
        summary.append(String.format("Spending Summary for %s:\n", monthYear));
        summary.append(String.format("- Total Spent: ₹%.2f\n", total));
        summary.append(String.format("- Change vs Previous Month: %s by %s\n", comp.changeDirection(), comp.changePercent()));
        summary.append("- Breakdown by category:\n");
        breakdown.forEach(b -> summary.append(String.format("  * %s: ₹%.2f\n", b.category(), b.amount())));

        // Fetch AI insight
        String insight = aiClient.getSpendingInsight(summary.toString()).block();
        if (insight == null || insight.isBlank()) {
            insight = "Vault AI is currently processing your transactions. Please check back shortly.";
        }

        return new InsightResponse(monthYear, insight, breakdown);
    }

    private LocalDate parseMonthYear(String my) {
        // Expected format: YYYY-MM
        return LocalDate.parse(my + "-01");
    }
}
