package com.supplychain.riskanalysis.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.supplychain.riskanalysis.dto.AiExplainRequest;
import com.supplychain.riskanalysis.dto.AiExplainResponse;
import org.springframework.stereotype.Service;

/**
 * Service that uses the Google Gemini API to generate a plain-English
 * risk narrative from algorithm output (critical path or disruption
 * simulation).
 *
 * <p>
 * The Gemini client is initialised once on bean creation. It reads the API
 * key from the {@code GOOGLE_API_KEY} environment variable automatically; the
 * {@code @Value} injection here is used only to detect a missing key at startup
 * so we can fail fast with a clear error message rather than a cryptic 401.
 */
@Service
public class AiAnalysisService {

    private static final String MODEL = "gemini-2.5-flash";

    private Client geminiClient;

    public AiAnalysisService() {
        // We delay client initialization so the application does not crash on startup
        // if the GOOGLE_API_KEY environment variable is missing.
    }

    /**
     * Generates a natural-language narrative for the given analysis result.
     *
     * @param request contains {@code type} ("critical-path" or "simulation")
     *                and {@code data} (JSON string of the algorithm response)
     * @return {@link AiExplainResponse} wrapping the Gemini-generated text
     */
    public AiExplainResponse explain(AiExplainRequest request) {
        String apiKey = System.getenv("GOOGLE_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "Google Gemini API token was not found. Please set the GOOGLE_API_KEY environment variable.");
        }

        if (this.geminiClient == null) {
            this.geminiClient = new Client();
        }

        String prompt = buildPrompt(request);

        GenerateContentResponse response = geminiClient.models.generateContent(
                MODEL,
                prompt,
                null);

        String narrative = response.text();
        return new AiExplainResponse(narrative);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────────────

    private String buildPrompt(AiExplainRequest request) {
        return switch (request.getType()) {
            case "critical-path" -> buildCriticalPathPrompt(request.getData());
            case "simulation" -> buildSimulationPrompt(request.getData());
            default -> throw new IllegalArgumentException(
                    "Unknown analysis type: " + request.getType() +
                            ". Expected 'critical-path' or 'simulation'.");
        };
    }

    private String buildCriticalPathPrompt(String data) {
        return """
                You are a senior supply chain risk analyst writing a concise executive briefing.

                Below is the output of a critical-path algorithm run on a real supply chain graph.
                The algorithm uses a weighted DAG with topological sort to find the highest-risk path.
                Each edge carries a combined risk weight derived from disruption probability and impact severity.

                Critical-path result (JSON):
                %s

                Write a 3-4 sentence executive risk summary:
                1. Identify the critical path nodes from source to destination.
                2. State the total risk weight and what it means in practical terms.
                3. Name the single riskiest link (highest weight edge) and explain why it is dangerous.
                4. Give one concrete mitigation recommendation.

                Use plain business English — no JSON, no bullet points, no markdown.
                Be specific: use the actual node names from the data.
                """.formatted(data);
    }

    private String buildSimulationPrompt(String data) {
        return """
                You are a senior supply chain risk analyst writing a concise executive briefing.

                Below is the output of a disruption-propagation simulation on a real supply chain graph.
                The simulation uses BFS over a directed graph, propagating failure day-by-day based on
                each node's inventory buffer and each edge's lead time.

                Simulation result (JSON — timeline of node failures in order):
                %s

                Write a 3-4 sentence executive risk summary:
                1. State which node was the point of failure and when cascading effects begin.
                2. Identify the 2-3 most critical downstream nodes that fail earliest.
                3. Quantify the total disruption window (first failure day to last failure day).
                4. Give one concrete mitigation recommendation to reduce cascade speed.

                Use plain business English — no JSON, no bullet points, no markdown.
                Be specific: use the actual node names and failure days from the data.
                """.formatted(data);
    }
}
