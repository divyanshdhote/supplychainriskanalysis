package com.supplychain.riskanalysis.strategy.weight;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class EdgeWeightStrategyFactory {

    private static final Set<String> SUPPORTED_STRATEGIES = Set.of("RISK_BASED", "LEAD_TIME");

    private final Map<String, EdgeWeightStrategy> strategies;

    public EdgeWeightStrategy getStrategy(String type) {
        String normalizedType = normalize(type);
        EdgeWeightStrategy strategy = strategies.get(normalizedType);

        if (strategy == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid weightType '" + type + "'. Supported values: " + SUPPORTED_STRATEGIES
            );
        }

        return strategy;
    }

    private String normalize(String type) {
        if (type == null || type.isBlank()) {
            return "RISK_BASED";
        }

        return type
                .trim()
                .replace('-', '_')
                .replace(' ', '_')
                .toUpperCase(Locale.ROOT);
    }
}
