package com.supplychain.riskanalysis.service;

import com.supplychain.riskanalysis.dto.EdgeRequest;
import com.supplychain.riskanalysis.entity.Edge;
import com.supplychain.riskanalysis.entity.Node;
import com.supplychain.riskanalysis.repository.EdgeRepository;
import com.supplychain.riskanalysis.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EdgeService {

    private final EdgeRepository edgeRepository;
    private final NodeRepository nodeRepository;

    public Edge createEdge(EdgeRequest request) {

        Node fromNode = nodeRepository.findById(request.getFromNodeId())
                .orElseThrow(() -> new RuntimeException("From node not found"));

        Node toNode = nodeRepository.findById(request.getToNodeId())
                .orElseThrow(() -> new RuntimeException("To node not found"));

        Edge edge = Edge.builder()
                .fromNode(fromNode)
                .toNode(toNode)
                .leadTimeDays(request.getLeadTimeDays())
                .disruptionProbability(request.getDisruptionProbability())
                .impactSeverity(request.getImpactSeverity())
                .build();

        return edgeRepository.save(edge);
    }
}