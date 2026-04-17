package com.supplychain.riskanalysis.algorithm;

import com.supplychain.riskanalysis.entity.Edge;

import java.util.List;
import java.util.Map;

public interface GraphAlgorithm {

    Object execute(Map<Long, List<Edge>> graph, String weightType);
}