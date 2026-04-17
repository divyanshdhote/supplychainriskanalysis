package com.supplychain.riskanalysis.algorithm.criticalpath;

import com.supplychain.riskanalysis.algorithm.GraphAlgorithm;
import com.supplychain.riskanalysis.dto.CriticalPathResponse;
import com.supplychain.riskanalysis.dto.PathEdge;
import com.supplychain.riskanalysis.entity.Edge;
import com.supplychain.riskanalysis.entity.Node;
import com.supplychain.riskanalysis.strategy.weight.EdgeWeightStrategy;
import com.supplychain.riskanalysis.strategy.weight.EdgeWeightStrategyFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
public class CriticalPathAlgorithm implements GraphAlgorithm {

    private final EdgeWeightStrategyFactory factory;

    @Override
    public Object execute(Map<Long, List<Edge>> graph, String weightType) {

        EdgeWeightStrategy strategy = factory.getStrategy(weightType);

        Set<Long> nodes = extractNodes(graph);

        Map<Long, Integer> indegree = buildIndegree(nodes, graph);

        // 🔥 Virtual source
        Long virtualSource = -1L;
        graph.putIfAbsent(virtualSource, new ArrayList<>());

        for (Long node : nodes) {
            if (indegree.get(node) == 0) {
                graph.get(virtualSource).add(createZeroEdge(node));
            }
        }

        nodes.add(virtualSource);

        List<Long> topoOrder = topologicalSort(nodes, graph);

        Map<Long, Double> dist = new HashMap<>();
        Map<Long, Long> parent = new HashMap<>();

        for (Long node : nodes) {
            dist.put(node, Double.NEGATIVE_INFINITY);
        }

        dist.put(virtualSource, 0.0);

        for (Long u : topoOrder) {

            if (dist.get(u) == Double.NEGATIVE_INFINITY) continue;

            for (Edge edge : graph.getOrDefault(u, new ArrayList<>())) {

                Long v = edge.getToNode().getId();
                double weight = strategy.calculateWeight(edge);

                if (dist.get(u) + weight > dist.getOrDefault(v, Double.NEGATIVE_INFINITY)) {
                    dist.put(v, dist.get(u) + weight);
                    parent.put(v, u);
                }
            }
        }
        // finding the maxDist node
        Long endNode = null;
        double maxDist = Double.NEGATIVE_INFINITY;

        for (Long node : dist.keySet()) {
            if (node.equals(virtualSource)) continue;

            if (dist.get(node) > maxDist) {
                maxDist = dist.get(node);
                endNode = node;
            }
        }

        //Reconstructing path
        List<Long> path = new ArrayList<>();

        while (endNode != null && !endNode.equals(virtualSource)) {
            path.add(endNode);
            endNode = parent.get(endNode);
        }

        Collections.reverse(path);

        // Step 9: Convert node path → edge path with weights

        List<PathEdge> pathEdges = new ArrayList<>();
        double totalWeight = 0.0;

        for (int i = 0; i < path.size() - 1; i++) {

            Long from = path.get(i);
            Long to = path.get(i + 1);

            Edge matchingEdge = findEdge(graph, from, to);

            double weight = strategy.calculateWeight(matchingEdge);

            totalWeight += weight;

            pathEdges.add(new PathEdge(
                    from,
                    matchingEdge.getFromNode().getName(),
                    to,
                    matchingEdge.getToNode().getName(),
                    weight
            ));
        }

// Final response
        return new CriticalPathResponse(pathEdges, totalWeight);
    }

    // ================= HELPERS =================

    private Edge findEdge(Map<Long, List<Edge>> graph, Long from, Long to) {

        for (Edge edge : graph.getOrDefault(from, new ArrayList<>())) {
            if (edge.getToNode().getId().equals(to)) {
                return edge;
            }
        }

        throw new RuntimeException("Edge not found from " + from + " to " + to);
    }

    private Set<Long> extractNodes(Map<Long, List<Edge>> graph) {
        Set<Long> nodes = new HashSet<>();

        for (Long u : graph.keySet()) {
            nodes.add(u);
            for (Edge e : graph.get(u)) {
                nodes.add(e.getToNode().getId());
            }
        }

        return nodes;
    }

    private Map<Long, Integer> buildIndegree(Set<Long> nodes, Map<Long, List<Edge>> graph) {
        Map<Long, Integer> indegree = new HashMap<>();

        for (Long node : nodes) {
            indegree.put(node, 0);
        }

        for (Long u : graph.keySet()) {
            for (Edge e : graph.get(u)) {
                Long v = e.getToNode().getId();
                indegree.put(v, indegree.getOrDefault(v, 0) + 1);
            }
        }

        return indegree;
    }

    private List<Long> topologicalSort(Set<Long> nodes, Map<Long, List<Edge>> graph) {

        Map<Long, Integer> indegree = buildIndegree(nodes, graph);

        Queue<Long> queue = new LinkedList<>();

        for (Long node : nodes) {
            if (indegree.get(node) == 0) {
                queue.add(node);
            }
        }

        List<Long> topo = new ArrayList<>();

        while (!queue.isEmpty()) {
            Long u = queue.poll();
            topo.add(u);

            for (Edge e : graph.getOrDefault(u, new ArrayList<>())) {
                Long v = e.getToNode().getId();

                indegree.put(v, indegree.get(v) - 1);

                if (indegree.get(v) == 0) {
                    queue.add(v);
                }
            }
        }

        return topo;
    }

    private Edge createZeroEdge(Long toNodeId) {
        Edge edge = new Edge();

        edge.setLeadTimeDays(0);
        edge.setDisruptionProbability(0.0);
        edge.setImpactSeverity(0.0);

        Node node = new Node();
        node.setId(toNodeId);

        edge.setToNode(node);

        return edge;
    }
}