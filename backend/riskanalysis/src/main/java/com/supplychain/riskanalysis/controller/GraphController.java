package com.supplychain.riskanalysis.controller;

import com.supplychain.riskanalysis.entity.Edge;
import com.supplychain.riskanalysis.service.GraphService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/graph")
@RequiredArgsConstructor
public class GraphController {

    private final GraphService graphService;

    @GetMapping("/adjacency")
    public Map<Long, List<Edge>> getAdjacencyList() {
        return graphService.buildAdjacencyList();
    }
}