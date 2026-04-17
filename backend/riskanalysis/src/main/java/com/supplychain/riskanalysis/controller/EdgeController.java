package com.supplychain.riskanalysis.controller;

import com.supplychain.riskanalysis.dto.EdgeRequest;
import com.supplychain.riskanalysis.entity.Edge;
import com.supplychain.riskanalysis.service.EdgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/edges")
@RequiredArgsConstructor
public class EdgeController {

    private final EdgeService edgeService;

    @PostMapping
    public Edge createEdge(@RequestBody EdgeRequest request) {
        return edgeService.createEdge(request);
    }
}