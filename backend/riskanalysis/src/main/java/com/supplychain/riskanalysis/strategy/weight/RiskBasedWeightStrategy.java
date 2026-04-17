package com.supplychain.riskanalysis.strategy.weight;

import com.supplychain.riskanalysis.entity.Edge;
import org.springframework.stereotype.Component;

@Component("RISK_BASED")
public class RiskBasedWeightStrategy implements EdgeWeightStrategy {

    @Override
    public double calculateWeight(Edge edge) {
        double riskScore = edge.getDisruptionProbability() * edge.getImpactSeverity();
        return edge.getLeadTimeDays() * (1 + riskScore);
    }
}