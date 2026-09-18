package com.farmverse.backend.repository;

import com.farmverse.backend.model.DiseaseRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiseaseRecordRepository extends JpaRepository<DiseaseRecord, Long> {
}
