package com.farmverse.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "yield_predictions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YieldPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cropName;
    private String variety;
    private Double areaAcres;
    private Double predictedYieldTons;
    private Double confidenceScore;
    private String riskFactors;
    private String optimalHarvestWindow;
}
