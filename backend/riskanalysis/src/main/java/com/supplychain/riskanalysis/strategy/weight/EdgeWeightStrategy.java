package com.supplychain.riskanalysis.strategy.weight;

import com.supplychain.riskanalysis.entity.Edge;

public interface EdgeWeightStrategy {
    double calculateWeight(Edge edge);
}