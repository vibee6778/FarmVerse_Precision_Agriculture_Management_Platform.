package com.farmverse.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "fertilizer_recommendations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FertilizerRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cropName;
    private String fieldName;
    private String fertilizerType;
    private Double dosageKgPerAcre;
    private String applicationStage;
    private String npkRatio;
    private LocalDate recommendedDate;
    private String status; // Pending, Applied, Scheduled
    private String notes;
}
