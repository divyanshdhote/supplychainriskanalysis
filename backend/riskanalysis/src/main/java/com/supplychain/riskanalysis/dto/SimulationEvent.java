package com.supplychain.riskanalysis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SimulationEvent {

    private Long nodeId;
    private String nodeName;
    private int failureDay;
}