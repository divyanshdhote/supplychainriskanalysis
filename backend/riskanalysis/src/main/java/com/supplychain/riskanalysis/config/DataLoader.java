package com.supplychain.riskanalysis.config;

import com.supplychain.riskanalysis.entity.Edge;
import com.supplychain.riskanalysis.entity.Node;
import com.supplychain.riskanalysis.enums.NodeType;
import com.supplychain.riskanalysis.enums.OperatingStatus;
import com.supplychain.riskanalysis.repository.EdgeRepository;
import com.supplychain.riskanalysis.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final NodeRepository nodeRepository;
    private final EdgeRepository edgeRepository;

    @Override
    public void run(String... args) {

        // Prevent duplicate inserts
        if (nodeRepository.count() > 0)
            return;

        // ---------------- NODES ----------------

        Node company = nodeRepository.save(
                new Node(null, "Your Company", NodeType.RETAILER, 0, 3, OperatingStatus.ACTIVE, "India", "Central"));

        Node dNorth = nodeRepository.save(new Node(null, "Distributor North", NodeType.DISTRIBUTOR, 1, 5,
                OperatingStatus.ACTIVE, "India", "North"));
        Node dSouth = nodeRepository.save(new Node(null, "Distributor South", NodeType.DISTRIBUTOR, 1, 6,
                OperatingStatus.ACTIVE, "India", "South"));
        Node dExport = nodeRepository.save(new Node(null, "Distributor Export", NodeType.DISTRIBUTOR, 1, 7,
                OperatingStatus.ACTIVE, "India", "West"));

        Node wDelhi = nodeRepository.save(
                new Node(null, "Warehouse Delhi", NodeType.WAREHOUSE, 2, 7, OperatingStatus.ACTIVE, "India", "North"));
        Node wMumbai = nodeRepository.save(
                new Node(null, "Warehouse Mumbai", NodeType.WAREHOUSE, 2, 8, OperatingStatus.ACTIVE, "India", "West"));
        Node wChennai = nodeRepository.save(new Node(null, "Warehouse Chennai", NodeType.WAREHOUSE, 2, 6,
                OperatingStatus.ACTIVE, "India", "South"));

        Node fA = nodeRepository
                .save(new Node(null, "Factory A", NodeType.FACTORY, 3, 4, OperatingStatus.ACTIVE, "India", "West"));
        Node fB = nodeRepository
                .save(new Node(null, "Factory B", NodeType.FACTORY, 3, 5, OperatingStatus.ACTIVE, "India", "South"));
        Node fC = nodeRepository.save(new Node(null, "Factory C (Backup)", NodeType.FACTORY, 3, 6,
                OperatingStatus.ACTIVE, "Vietnam", "APAC"));

        Node sSteel = nodeRepository.save(
                new Node(null, "Supplier Steel", NodeType.SUPPLIER, 4, 6, OperatingStatus.ACTIVE, "China", "Asia"));
        Node sPlastic = nodeRepository.save(
                new Node(null, "Supplier Plastic", NodeType.SUPPLIER, 4, 5, OperatingStatus.ACTIVE, "India", "West"));
        Node sElectronics = nodeRepository.save(new Node(null, "Supplier Electronics", NodeType.SUPPLIER, 4, 5,
                OperatingStatus.ACTIVE, "Taiwan", "APAC"));
        Node sPackaging = nodeRepository.save(new Node(null, "Supplier Packaging", NodeType.SUPPLIER, 4, 4,
                OperatingStatus.ACTIVE, "India", "North"));

        Node ironOre = nodeRepository.save(new Node(null, "Iron Ore Mine", NodeType.SUB_SUPPLIER, 5, 10,
                OperatingStatus.ACTIVE, "Australia", "APAC"));
        Node crudeOil = nodeRepository.save(new Node(null, "Crude Oil Plant", NodeType.SUB_SUPPLIER, 5, 9,
                OperatingStatus.ACTIVE, "UAE", "Middle East"));
        Node silicon = nodeRepository.save(
                new Node(null, "Silicon Mine", NodeType.SUB_SUPPLIER, 5, 8, OperatingStatus.ACTIVE, "Chile", "LATAM"));
        Node paperMill = nodeRepository.save(
                new Node(null, "Paper Mill", NodeType.SUB_SUPPLIER, 5, 7, OperatingStatus.ACTIVE, "Indonesia", "APAC"));

        // ---------------- EDGES ----------------

        // 🔴 Critical Path
        edgeRepository.save(new Edge(null, ironOre, sSteel, 9, 0.7, 0.9));
        edgeRepository.save(new Edge(null, sSteel, fA, 7, 0.6, 0.8));
        edgeRepository.save(new Edge(null, fA, wMumbai, 6, 0.5, 0.8));
        edgeRepository.save(new Edge(null, wMumbai, dSouth, 5, 0.4, 0.7));
        edgeRepository.save(new Edge(null, dSouth, company, 4, 0.3, 0.6));

        // 🟡 Secondary Chain
        edgeRepository.save(new Edge(null, crudeOil, sPlastic, 6, 0.3, 0.6));
        edgeRepository.save(new Edge(null, sPlastic, fB, 5, 0.3, 0.5));
        edgeRepository.save(new Edge(null, fB, wDelhi, 4, 0.2, 0.4));
        edgeRepository.save(new Edge(null, wDelhi, dNorth, 3, 0.2, 0.3));
        edgeRepository.save(new Edge(null, dNorth, company, 2, 0.1, 0.2));

        // 🔵 Electronics Chain (Hidden Risk)
        edgeRepository.save(new Edge(null, silicon, sElectronics, 8, 0.6, 0.9));
        edgeRepository.save(new Edge(null, sElectronics, fA, 5, 0.5, 0.8));

        // 🟢 Packaging Chain
        edgeRepository.save(new Edge(null, paperMill, sPackaging, 5, 0.2, 0.4));
        edgeRepository.save(new Edge(null, sPackaging, fC, 4, 0.2, 0.3));

        // 🔁 Cross Dependencies (important for simulation)
        edgeRepository.save(new Edge(null, sPlastic, fA, 4, 0.4, 0.6));
        edgeRepository.save(new Edge(null, sSteel, fB, 5, 0.5, 0.7));
        edgeRepository.save(new Edge(null, sElectronics, fB, 6, 0.4, 0.7));
    }
}