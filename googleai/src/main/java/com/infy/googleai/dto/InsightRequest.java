package com.infy.googleai.dto;

/**
 * Request payload for the spending insight endpoint.
 * The spendingSummary contains structured spending data as text,
 * which Gemini uses to generate a human-readable insight.
 */
public record InsightRequest(String spendingSummary) {}
