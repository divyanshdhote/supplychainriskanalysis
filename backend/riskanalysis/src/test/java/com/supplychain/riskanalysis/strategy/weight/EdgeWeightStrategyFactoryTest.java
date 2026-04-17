package com.supplychain.riskanalysis.strategy.weight;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

class EdgeWeightStrategyFactoryTest {

    private final EdgeWeightStrategy riskBasedStrategy = edge -> 1.0;
    private final EdgeWeightStrategy leadTimeStrategy = edge -> 2.0;

    private final EdgeWeightStrategyFactory factory = new EdgeWeightStrategyFactory(
            Map.of(
                    "RISK_BASED", riskBasedStrategy,
                    "LEAD_TIME", leadTimeStrategy
            )
    );

    @Test
    void shouldNormalizeAliasesForRiskBasedStrategy() {
        assertSame(riskBasedStrategy, factory.getStrategy("risk_based"));
        assertSame(riskBasedStrategy, factory.getStrategy("risk-based"));
        assertSame(riskBasedStrategy, factory.getStrategy("risk based"));
        assertSame(riskBasedStrategy, factory.getStrategy(" RISK_BASED "));
    }

    @Test
    void shouldNormalizeAliasesForLeadTimeStrategy() {
        assertSame(leadTimeStrategy, factory.getStrategy("lead_time"));
        assertSame(leadTimeStrategy, factory.getStrategy("lead-time"));
        assertSame(leadTimeStrategy, factory.getStrategy("lead time"));
    }

    @Test
    void shouldDefaultToRiskBasedWhenTypeIsBlank() {
        assertSame(riskBasedStrategy, factory.getStrategy(null));
        assertSame(riskBasedStrategy, factory.getStrategy(""));
        assertSame(riskBasedStrategy, factory.getStrategy("   "));
    }

    @Test
    void shouldRejectUnsupportedWeightType() {
        assertThrows(ResponseStatusException.class, () -> factory.getStrategy("cost"));
    }
}
