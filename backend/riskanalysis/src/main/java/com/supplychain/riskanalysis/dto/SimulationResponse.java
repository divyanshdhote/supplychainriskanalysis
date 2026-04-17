package com.supplychain.riskanalysis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class SimulationResponse {

    private List<SimulationEvent> timeline;
}