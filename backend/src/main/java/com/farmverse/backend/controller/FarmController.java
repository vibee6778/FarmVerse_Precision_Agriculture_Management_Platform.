package com.farmverse.backend.controller;

import com.farmverse.backend.model.*;
import com.farmverse.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/farms")
public class FarmController {

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private SensorDataRepository sensorDataRepository;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Current user not found in database: " + email));
    }

    @GetMapping
    public ResponseEntity<List<Farm>> getMyFarms() {
        User user = getAuthenticatedUser();
        List<Farm> farms = farmRepository.findByOwnerId(user.getId());
        return ResponseEntity.ok(farms);
    }

    @PostMapping
    public ResponseEntity<?> createFarm(@RequestBody Farm farmRequest) {
        User user = getAuthenticatedUser();
        
        Farm farm = Farm.builder()
                .name(farmRequest.getName())
                .location(farmRequest.getLocation())
                .sizeAcres(farmRequest.getSizeAcres())
                .soilType(farmRequest.getSoilType())
                .owner(user)
                .build();
                
        Farm savedFarm = farmRepository.save(farm);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedFarm);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFarmById(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        Farm farm = farmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Farm not found with id: " + id));

        if (!farm.getOwner().getId().equals(user.getId()) && user.getRole() != Role.ROLE_AGRONOMIST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Access Denied. You do not own this farm.");
        }

        return ResponseEntity.ok(farm);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFarm(@PathVariable Long id, @RequestBody Farm farmDetails) {
        User user = getAuthenticatedUser();
        Farm farm = farmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Farm not found with id: " + id));

        if (!farm.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Access Denied. You do not own this farm.");
        }

        farm.setName(farmDetails.getName());
        farm.setLocation(farmDetails.getLocation());
        farm.setSizeAcres(farmDetails.getSizeAcres());
        farm.setSoilType(farmDetails.getSoilType());

        Farm updatedFarm = farmRepository.save(farm);
        return ResponseEntity.ok(updatedFarm);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFarm(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        Farm farm = farmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Farm not found with id: " + id));

        if (!farm.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Access Denied. You do not own this farm.");
        }

        // 1. Delete associated sensor data
        List<SensorData> sensorData = sensorDataRepository.findByDeviceFarmIdOrderByTimestampDesc(id);
        sensorDataRepository.deleteAll(sensorData);

        // 2. Delete associated devices
        List<Device> devices = deviceRepository.findByFarmId(id);
        deviceRepository.deleteAll(devices);

        // 3. Delete associated alerts
        List<Alert> alerts = alertRepository.findByFarmIdOrderByTimestampDesc(id);
        alertRepository.deleteAll(alerts);

        // 4. Finally delete the farm
        farmRepository.delete(farm);
        return ResponseEntity.ok("Farm deleted successfully!");
    }
}
