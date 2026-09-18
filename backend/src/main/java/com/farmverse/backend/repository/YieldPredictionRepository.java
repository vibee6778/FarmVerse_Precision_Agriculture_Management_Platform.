package com.farmverse.backend.repository;

import com.farmverse.backend.model.YieldPrediction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface YieldPredictionRepository extends JpaRepository<YieldPrediction, Long> {
}
