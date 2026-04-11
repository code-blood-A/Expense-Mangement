package com.infy.analysisMS.dto;

import java.util.List;

public record InsightResponse(
        String month,
        String insight,
        List<CategorySpendResponse> categoryBreakdown
) {}
