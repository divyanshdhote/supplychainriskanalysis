package com.supplychain.riskanalysis.controller;

import com.supplychain.riskanalysis.dto.AiExplainRequest;
import com.supplychain.riskanalysis.dto.AiExplainResponse;
import com.supplychain.riskanalysis.service.AiAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller that exposes the Gemini-powered explanation endpoint.
 *
 * <p>{@code POST /analysis/ai-explain} accepts the raw algorithm result
 * from the frontend and returns a plain-English executive narrative.
 */
@RestController
@RequestMapping("/analysis")
@RequiredArgsConstructor
public class AiAnalysisController {

    private final AiAnalysisService aiAnalysisService;

    /**
     * Generates a Gemini-powered narrative for a completed analysis.
     *
     * @param request body must contain:
     *   <ul>
     *     <li>{@code type} — "critical-path" or "simulation"</li>
     *     <li>{@code data} — serialised JSON of the algorithm's response object</li>
     *   </ul>
     * @return {@link AiExplainResponse} with the generated narrative string
     */
    @PostMapping("/ai-explain")
    public AiExplainResponse explain(@RequestBody AiExplainRequest request) {
        return aiAnalysisService.explain(request);
    }
}
