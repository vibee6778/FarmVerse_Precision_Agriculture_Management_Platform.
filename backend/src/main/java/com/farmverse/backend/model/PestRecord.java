package com.farmverse.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "pest_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PestRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String pestName;
    private String cropAffected;
    private String severity; // Low, Medium, High, Critical
    private String treatmentMethod;
    private String status; // Active, Controlled, Resolved
    private LocalDate detectedDate;
    private String affectedArea;
    private String symptoms;
}
