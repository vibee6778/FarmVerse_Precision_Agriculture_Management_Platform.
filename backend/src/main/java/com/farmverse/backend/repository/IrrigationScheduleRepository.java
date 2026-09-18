package com.farmverse.backend.repository;

import com.farmverse.backend.model.IrrigationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IrrigationScheduleRepository extends JpaRepository<IrrigationSchedule, Long> {
    List<IrrigationSchedule> findByFarmOwnerId(Long ownerId);
    List<IrrigationSchedule> findByFarmId(Long farmId);
}
