package com.supplychain.riskanalysis.algorithm.simulation;

import com.supplychain.riskanalysis.algorithm.GraphAlgorithm;
import com.supplychain.riskanalysis.dto.SimulationEvent;
import com.supplychain.riskanalysis.dto.SimulationResponse;
import com.supplychain.riskanalysis.entity.Edge;
import com.supplychain.riskanalysis.entity.Node;
import com.supplychain.riskanalysis.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
public class DisruptionSimulationAlgorithm implements GraphAlgorithm {

    private final NodeRepository nodeRepository;

    @Override
    public Object execute(Map<Long, List<Edge>> graph, String startNodeIdStr) {

        Long startNodeId = Long.parseLong(startNodeIdStr);

        // Min time to failure
        Map<Long, Integer> failureTime = new HashMap<>();

        Queue<Long> queue = new LinkedList<>();

        // Start node fails at day 0
        failureTime.put(startNodeId, 0);
        queue.add(startNodeId);

        while (!queue.isEmpty()) {

            Long current = queue.poll();
            int currentFailureTime = failureTime.get(current);

            for (Edge edge : graph.getOrDefault(current, new ArrayList<>())) {

                Long next = edge.getToNode().getId();

                Node nextNode = nodeRepository.findById(next)
                        .orElseThrow(() -> new RuntimeException("Node not found"));

                int buffer = nextNode.getInventoryBufferDays();
                int leadTime = edge.getLeadTimeDays();

                int newFailureTime = currentFailureTime + buffer + leadTime;

                // Only update if earlier failure
                if (!failureTime.containsKey(next) || newFailureTime < failureTime.get(next)) {
                    failureTime.put(next, newFailureTime);
                    queue.add(next);
                }
            }
        }

        // Convert to timeline
        List<SimulationEvent> timeline = new ArrayList<>();

        for (Map.Entry<Long, Integer> entry : failureTime.entrySet()) {

            Node node = nodeRepository.findById(entry.getKey())
                    .orElseThrow(() -> new RuntimeException("Node not found"));

            timeline.add(new SimulationEvent(
                    node.getId(),
                    node.getName(),
                    entry.getValue()
            ));
        }

        // Sort by failure time
        timeline.sort(Comparator.comparingInt(SimulationEvent::getFailureDay));

        return new SimulationResponse(timeline);
    }
}