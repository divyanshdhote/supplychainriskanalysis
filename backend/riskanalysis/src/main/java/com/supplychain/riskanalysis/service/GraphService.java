package com.supplychain.riskanalysis.service;

import com.supplychain.riskanalysis.entity.Edge;
import com.supplychain.riskanalysis.repository.EdgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GraphService {

    private final EdgeRepository edgeRepository;

    /**
     * Builds adjacency list:
     * fromNodeId -> list of outgoing edges
     */
    public Map<Long, List<Edge>> buildAdjacencyList() {

        List<Edge> edges = edgeRepository.findAll();

        Map<Long, List<Edge>> adjacencyList = new HashMap<>();

        for (Edge edge : edges) {
            Long fromId = edge.getFromNode().getId();

            adjacencyList
                    .computeIfAbsent(fromId, k -> new ArrayList<>())
                    .add(edge);
        }

        return adjacencyList;
    }
}