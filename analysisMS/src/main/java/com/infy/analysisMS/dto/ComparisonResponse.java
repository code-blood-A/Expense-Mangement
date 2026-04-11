package com.infy.analysisMS.dto;

public record ComparisonResponse(
        String currentMonth,
        String previousMonth,
        Double currentSpend,
        Double previousSpend,
        String changePercent,
        String changeDirection
) {}
