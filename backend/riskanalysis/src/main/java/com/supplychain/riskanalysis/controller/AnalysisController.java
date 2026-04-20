package com.supplychain.riskanalysis.controller;

import com.supplychain.riskanalysis.dto.CriticalPathResponse;
import com.supplychain.riskanalysis.dto.SimulationRequest;
import com.supplychain.riskanalysis.dto.SimulationResponse;
import com.supplychain.riskanalysis.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private static final String DEFAULT_WEIGHT_TYPE = "RISK_BASED";

    private final AnalysisService analysisService;

    @GetMapping("/critical-path")
    public CriticalPathResponse getCriticalPath(
            @RequestParam(defaultValue = DEFAULT_WEIGHT_TYPE) String weightType) {
        return analysisService.getCriticalPath(weightType);
    }

    @PostMapping("/simulate")
    public SimulationResponse simulate(@RequestBody SimulationRequest request) {
        return analysisService.simulate(request.getFailedNodeId());
    }
}
