package com.supplychain.riskanalysis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PathEdge {

    private Long fromNodeId;
    private String fromNodeName;

    private Long toNodeId;
    private String toNodeName;

    private double weight;
}