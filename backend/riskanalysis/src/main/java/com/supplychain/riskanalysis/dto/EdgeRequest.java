package com.supplychain.riskanalysis.dto;

import lombok.Data;

@Data
public class EdgeRequest {

    private Long fromNodeId;
    private Long toNodeId;

    private Integer leadTimeDays;
    private Double disruptionProbability;
    private Double impactSeverity;
}