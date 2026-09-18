package com.farmverse.backend.repository;

import com.farmverse.backend.model.PestRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PestRecordRepository extends JpaRepository<PestRecord, Long> {
}
