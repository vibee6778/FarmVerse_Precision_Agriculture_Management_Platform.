package com.farmverse.backend.controller;

import com.farmverse.backend.model.Device;
import com.farmverse.backend.model.DeviceType;
import com.farmverse.backend.model.Farm;
import com.farmverse.backend.model.User;
import com.farmverse.backend.repository.DeviceRepository;
import com.farmverse.backend.repository.FarmRepository;
import com.farmverse.backend.repository.UserRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Current user not found: " + email));
    }

    @Data
    public static class DeviceRegisterRequest {
        private String name;
        private String macAddress;
        private DeviceType type;
        private Long farmId;
    }

    @PostMapping
    public ResponseEntity<?> registerDevice(@RequestBody DeviceRegisterRequest request) {
        User user = getAuthenticatedUser();
        Farm farm = farmRepository.findById(request.getFarmId())
                .orElseThrow(() -> new RuntimeException("Farm not found with id: " + request.getFarmId()));

        if (!farm.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Error: Access Denied. You do not own the target farm.");
        }

        if (deviceRepository.findByMacAddress(request.getMacAddress()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: A device with this MAC address is already registered.");
        }

        Device device = Device.builder()
                .name(request.getName())
                .macAddress(request.getMacAddress())
                .type(request.getType())
                .farm(farm)
                .active(true)
                .build();

        Device savedDevice = deviceRepository.save(device);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDevice);
    }

    @GetMapping("/farm/{farmId}")
    public ResponseEntity<?> getDevicesByFarm(@PathVariable Long farmId) {
        User user = getAuthenticatedUser();
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found with id: " + farmId));

        if (!farm.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Error: Access Denied. You do not own this farm.");
        }

        List<Device> devices = deviceRepository.findByFarmId(farmId);
        return ResponseEntity.ok(devices);
    }
}
