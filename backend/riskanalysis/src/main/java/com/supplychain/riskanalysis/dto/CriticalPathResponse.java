package com.supplychain.riskanalysis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CriticalPathResponse {

    private List<PathEdge> path;
    private double totalWeight;
}