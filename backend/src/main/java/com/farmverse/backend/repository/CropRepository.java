package com.farmverse.backend.repository;

import com.farmverse.backend.model.Crop;
import com.farmverse.backend.model.CropStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CropRepository extends JpaRepository<Crop, Long> {
    List<Crop> findByFarmIdOrderBySowingDateDesc(Long farmId);
    List<Crop> findByFarmOwnerIdOrderBySowingDateDesc(Long ownerId);
    long countByFarmOwnerIdAndStatus(Long ownerId, CropStatus status);
}
