package com.infy.googleai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class TransactionCategorizationService {

    private static final Logger log = LoggerFactory.getLogger(TransactionCategorizationService.class);

    private final ChatClient chatClient;
    private final RuleBasedCategorizationService ruleEngine;

    public TransactionCategorizationService(ChatClient.Builder chatClientBuilder,
                                            RuleBasedCategorizationService ruleEngine) {
        this.chatClient = chatClientBuilder.build();
        this.ruleEngine = ruleEngine;
    }

    /**
     * Categorizes a transaction description.
     *
     * <p>Strategy:
     * <ol>
     *   <li>Try the local keyword rule engine first (no API cost, zero latency).</li>
     *   <li>Only call the Gemini AI model when no rule matches.</li>
     * </ol>
     */
    public String categorizeTransaction(String description, String merchantName) {

        // --- 1. Fast path: rule-based categorization ---
        String ruleCategory = ruleEngine.categorize(description, merchantName);
        if (ruleCategory != null) {
            log.debug("Rule-based categorization matched '{}' / '{}' → {}", merchantName, description, ruleCategory);
            return ruleCategory;
        }

        // --- 2. Slow path: Gemini AI (only when rules don't match) ---
        log.debug("No rule matched; delegating to Gemini AI.");

        String prompt = """
                You are a transaction categorizer for a financial application.
                Categorize the following transaction into one of these specific categories:
                GROCERIES, RENT, UTILITIES, FOOD, ENTERTAINMENT, TRANSPORTATION, HEALTHCARE, SHOPPING, TRAVEL,
                MONEY_TRANSFER, BILL_PAYMENTS, METRO_RECHARGE.

                If the transaction does not clearly fall into any of these categories, use MISCELLANEOUS.
                Return ONLY the category name in upper case. Do not include any other text.

                Merchant: %s
                Description: %s
                """.formatted(merchantName != null ? merchantName : "Unknown",
                             description != null ? description : "No description");

        return chatClient.prompt()
                .user(prompt)
                .call()
                .content()
                .trim()
                .toUpperCase()
                .replace(".", "");
    }
}


