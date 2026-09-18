package com.farmverse.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "disease_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiseaseRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String diseaseName;
    private String cropName;
    private Double confidencePercentage;
    private String symptoms;
    private String recommendedFungicide;
    private String severity; // Low, Moderate, Severe
    private LocalDate detectedDate;
    private String imageUrl;
}
