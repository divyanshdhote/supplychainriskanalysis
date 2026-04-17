package com.supplychain.riskanalysis.service;

import com.supplychain.riskanalysis.algorithm.GraphAlgorithm;
import com.supplychain.riskanalysis.algorithm.criticalpath.CriticalPathAlgorithm;
import com.supplychain.riskanalysis.algorithm.simulation.DisruptionSimulationAlgorithm;
import com.supplychain.riskanalysis.dto.CriticalPathResponse;
import com.supplychain.riskanalysis.dto.SimulationResponse;
import com.supplychain.riskanalysis.entity.Edge;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final GraphService graphService;
    private final CriticalPathAlgorithm criticalPathAlgorithm;;
    private final DisruptionSimulationAlgorithm simulationAlgorithm;

    public CriticalPathResponse getCriticalPath(String weightType) {

        Map<Long, List<Edge>> graph = graphService.buildAdjacencyList();

        return (CriticalPathResponse) criticalPathAlgorithm.execute(graph, weightType);
    }

    public SimulationResponse simulate(Long nodeId) {

        Map<Long, List<Edge>> graph = graphService.buildAdjacencyList();

        return (SimulationResponse) simulationAlgorithm.execute(graph, String.valueOf(nodeId));
    }
}