package com.supplychain.riskanalysis.repository;

import com.supplychain.riskanalysis.entity.Edge;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EdgeRepository extends JpaRepository<Edge, Long> {
}