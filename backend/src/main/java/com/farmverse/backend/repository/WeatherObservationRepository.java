package com.farmverse.backend.repository;

import com.farmverse.backend.model.WeatherObservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WeatherObservationRepository extends JpaRepository<WeatherObservation, Long> {
    List<WeatherObservation> findTop30ByFarmIdOrderByObservedAtDesc(Long farmId);
}
