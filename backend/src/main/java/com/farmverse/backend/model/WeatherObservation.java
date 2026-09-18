package com.farmverse.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "weather_observations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherObservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    private Double latitude;
    private Double longitude;

    private Double temperatureC;
    private Double humidityPercent;
    private Double rainfallMm;
    private Double windSpeedKmh;

    private String weatherDescription;

    @Column(nullable = false)
    private LocalDateTime observedAt;
}
