package com.supplychain.riskanalysis.repository;

import com.supplychain.riskanalysis.entity.Node;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NodeRepository extends JpaRepository<Node, Long> {
}