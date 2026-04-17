package com.supplychain.riskanalysis.strategy.weight;

import com.supplychain.riskanalysis.entity.Edge;
import org.springframework.stereotype.Component;

@Component("LEAD_TIME")
public class LeadTimeWeightStrategy implements EdgeWeightStrategy {

    @Override
    public double calculateWeight(Edge edge) {
        return edge.getLeadTimeDays();
    }
}