package com.supplychain.riskanalysis.controller;

import com.supplychain.riskanalysis.entity.Node;
import com.supplychain.riskanalysis.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/nodes")
@RequiredArgsConstructor
public class NodeController {

    private final NodeRepository nodeRepository;

    @PostMapping
    public Node createNode(@RequestBody Node node) {
        return nodeRepository.save(node);
    }

    @GetMapping
    public List<Node> getAllNodes() {
        return nodeRepository.findAll();
    }
}