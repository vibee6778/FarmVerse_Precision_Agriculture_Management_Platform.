package com.farmverse.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    private Double moisture;    // percentage (0-100)
    private Double nitrogen;    // mg/kg
    private Double phosphorus;  // mg/kg
    private Double potassium;   // mg/kg
    private Double temperature; // celsius
    private Double humidity;    // percentage (0-100)

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
