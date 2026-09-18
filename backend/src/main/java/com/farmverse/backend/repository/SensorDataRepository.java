package com.farmverse.backend.repository;

import com.farmverse.backend.model.SensorData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SensorDataRepository extends JpaRepository<SensorData, Long> {
    List<SensorData> findByDeviceIdOrderByTimestampDesc(Long deviceId);
    List<SensorData> findByDeviceFarmIdOrderByTimestampDesc(Long farmId);
    Optional<SensorData> findFirstByDeviceIdOrderByTimestampDesc(Long deviceId);
}
