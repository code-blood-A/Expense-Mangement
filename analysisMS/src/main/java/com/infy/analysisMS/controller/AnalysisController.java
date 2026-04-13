package com.infy.analysisMS.controller;

import com.infy.analysisMS.dto.*;
import com.infy.analysisMS.service.AnalysisService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
@CrossOrigin(origins = "*")
public class AnalysisController {

    private final AnalysisService service;

    public AnalysisController(AnalysisService service) {
        this.service = service;
    }

    @GetMapping("/monthly-spend")
    public MonthlySpendResponse getMonthlySpend(@RequestParam String month) {
        return service.getMonthlySpend(month);
    }

    @GetMapping("/top-category")
    public CategorySpendResponse getTopCategory(@RequestParam String month) {
        return service.getTopCategory(month);
    }

    @GetMapping("/trend")
    public List<MonthlyTrendResponse> getTrend(@RequestParam(defaultValue = "6") int months) {
        return service.getMonthlyTrend(months);
    }

    @GetMapping("/compare")
    public ComparisonResponse compare(@RequestParam String month) {
        return service.compareMonths(month);
    }

    @GetMapping("/insight")
    public InsightResponse getInsight(@RequestParam String month) {
        return service.generateInsight(month);
    }

    @GetMapping("/breakdown")
    public List<CategorySpendResponse> getBreakdown(@RequestParam String month) {
        return service.getCategoryBreakdown(month);
    }
}

