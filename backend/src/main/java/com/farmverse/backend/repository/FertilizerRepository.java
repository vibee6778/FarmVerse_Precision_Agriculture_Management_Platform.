package com.farmverse.backend.repository;

import com.farmverse.backend.model.FertilizerRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FertilizerRepository extends JpaRepository<FertilizerRecommendation, Long> {
}
