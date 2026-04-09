package com.infy.googleai.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class TransactionCategorizationService {

    private final ChatClient chatClient;

    public TransactionCategorizationService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String categorizeTransaction(String description) {
        String prompt = """
            You are a transaction categorizer for a financial application.
            Categorize the following transaction description into one of these specific categories:
            GROCERIES, RENT, UTILITIES, DINING, ENTERTAINMENT, TRANSPORTATION, HEALTHCARE, SHOPPING, TRAVEL.
            If the description does not clearly fall into any of these categories, use the category MISCELLANEOUS.
            Return ONLY the category name. Do not include any other text, punctuation, or explanations.
            
            Transaction Description: %s
            """.formatted(description);

        return chatClient.prompt()
                .user(prompt)
                .call()
                .content()
                .trim();
    }
}
