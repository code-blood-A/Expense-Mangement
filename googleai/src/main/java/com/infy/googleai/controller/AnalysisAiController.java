package com.infy.googleai.controller;

import com.infy.googleai.dto.InsightRequest;
import com.infy.googleai.dto.InsightResponse;
import com.infy.googleai.service.SpendingInsightService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint for generating spending insights using Gemini.
 * Separated from transaction categorization for better modularity.
 */
@RestController
@RequestMapping("/api/analysis")
public class AnalysisAiController {

    private final SpendingInsightService insightService;

    public AnalysisAiController(SpendingInsightService insightService) {
        this.insightService = insightService;
    }

    @PostMapping("/insight")
    public InsightResponse getSpendingInsight(@RequestBody InsightRequest request) {
        String insight = insightService.generateInsight(request.spendingSummary());
        return new InsightResponse(insight);
    }
}
