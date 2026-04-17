package com.supplychain.riskanalysis.entity;

import com.supplychain.riskanalysis.enums.NodeType;
import com.supplychain.riskanalysis.enums.OperatingStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Node {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private NodeType type;

    private Integer tier;

    private Integer inventoryBufferDays;

    @Enumerated(EnumType.STRING)
    private OperatingStatus operatingStatus;

    private String country;

    private String region;
}