package com.infy.analysisMS.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Client to interact with the GoogleAI MS for specialized intelligence.
 */
@Component
public class GoogleAiClient {

    private final WebClient webClient;

    public GoogleAiClient(WebClient.Builder webClientBuilder, @Value("${googleai.base-url}") String baseUrl) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    /**
     * Calls the GoogleAI MS /api/analysis/insight endpoint.
     */
    public Mono<String> getSpendingInsight(String summary) {
        return webClient.post()
                .uri("/api/analysis/insight")
                .bodyValue(Map.of("spendingSummary", summary))
                .retrieve()
                .bodyToMono(Map.class)
                .map(res -> (String) res.get("insight"));
    }
}
