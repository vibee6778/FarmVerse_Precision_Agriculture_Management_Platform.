package com.farmverse.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "irrigation_schedules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IrrigationSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    private String sector;
    private String timeOfDay;
    private Integer durationMinutes;
    private Boolean active;
    private Double moistureTarget;
    private Double currentMoisture;
}
