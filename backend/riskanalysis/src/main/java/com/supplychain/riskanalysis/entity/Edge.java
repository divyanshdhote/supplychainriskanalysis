package com.supplychain.riskanalysis.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Edge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Source node
    @ManyToOne
    @JoinColumn(name = "from_node_id", nullable = false)
    private Node fromNode;

    // Destination node
    @ManyToOne
    @JoinColumn(name = "to_node_id", nullable = false)
    private Node toNode;

    private Integer leadTimeDays;

    private Double disruptionProbability;

    private Double impactSeverity;
}