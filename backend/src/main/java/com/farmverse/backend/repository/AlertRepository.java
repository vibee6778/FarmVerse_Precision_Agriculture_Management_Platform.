package com.farmverse.backend.repository;

import com.farmverse.backend.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByFarmIdOrderByTimestampDesc(Long farmId);
    List<Alert> findByFarmIdAndResolvedOrderByTimestampDesc(Long farmId, boolean resolved);
}
