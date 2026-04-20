package com.supplychain.riskanalysis.dto;

import lombok.Data;

/**
 * Request body for the POST /analysis/ai-explain endpoint.
 * <p>
 * {@code type} must be either "critical-path" or "simulation".
 * {@code data} is the raw JSON payload returned by the respective
 * algorithm endpoint — forwarded verbatim to Gemini as context.
 */
@Data
public class AiExplainRequest {

    /**
     * "critical-path" or "simulation"
     */
    private String type;

    /**
     * Serialised JSON of the algorithm result
     * (CriticalPathResponse or SimulationResponse).
     */
    private String data;
}
