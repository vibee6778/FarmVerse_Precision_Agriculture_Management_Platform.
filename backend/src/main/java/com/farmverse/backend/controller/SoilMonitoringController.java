package com.farmverse.backend.controller;

import com.farmverse.backend.model.*;
import com.farmverse.backend.repository.*;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/monitoring")
public class SoilMonitoringController {

    @Autowired
    private SensorDataRepository sensorDataRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AlertRepository alertRepository;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Current user not found: " + email));
    }

    @Data
    public static class TelemetryPayload {
        private String macAddress;
        private Double moisture;
        private Double nitrogen;
        private Double phosphorus;
        private Double potassium;
        private Double temperature;
        private Double humidity;
    }

    // PUBLIC Endpoint for edge nodes (ESP32/LoRa Gateways)
    @PostMapping("/telemetry")
    public ResponseEntity<?> receiveTelemetry(@RequestBody TelemetryPayload payload) {
        Device device = deviceRepository.findByMacAddress(payload.getMacAddress())
                .orElseThrow(() -> new RuntimeException("Device not registered with MAC Address: " + payload.getMacAddress()));

        if (!device.getActive()) {
            return ResponseEntity.badRequest().body("Error: Device is currently marked inactive.");
        }

        SensorData data = SensorData.builder()
                .device(device)
                .moisture(payload.getMoisture())
                .nitrogen(payload.getNitrogen())
                .phosphorus(payload.getPhosphorus())
                .potassium(payload.getPotassium())
                .temperature(payload.getTemperature())
                .humidity(payload.getHumidity())
                .timestamp(LocalDateTime.now())
                .build();

        SensorData savedData = sensorDataRepository.save(data);

        // Alert Engine Threshold Trigger Logic
        checkThresholdsAndCreateAlerts(device.getFarm(), payload);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedData);
    }

    private void checkThresholdsAndCreateAlerts(Farm farm, TelemetryPayload payload) {
        // 1. Critical moisture check
        if (payload.getMoisture() != null && payload.getMoisture() < 30.0) {
            String message = String.format(
                "Critical Moisture Drop: Moisture levels on Farm '%s' have fallen to %.1f%% (Threshold: 30%%). Triggering solenoid irrigation valve activation.",
                farm.getName(), payload.getMoisture()
            );
            
            // Check if there's already an active unresolved alert with the exact same issue to prevent spamming
            boolean alreadyAlerted = alertRepository.findByFarmIdAndResolvedOrderByTimestampDesc(farm.getId(), false)
                    .stream()
                    .anyMatch(a -> a.getMessage().contains("Critical Moisture Drop"));

            if (!alreadyAlerted) {
                Alert alert = Alert.builder()
                        .farm(farm)
                        .message(message)
                        .severity(AlertSeverity.CRITICAL)
                        .resolved(false)
                        .timestamp(LocalDateTime.now())
                        .build();
                alertRepository.save(alert);
            }
        }

        // 2. High temperature warning
        if (payload.getTemperature() != null && payload.getTemperature() > 40.0) {
            String message = String.format(
                "Warning: Extreme soil temperature detected on Farm '%s': %.1f°C. Risk of rapid water evaporation and heat distress to crop roots.",
                farm.getName(), payload.getTemperature()
            );

            boolean alreadyAlerted = alertRepository.findByFarmIdAndResolvedOrderByTimestampDesc(farm.getId(), false)
                    .stream()
                    .anyMatch(a -> a.getMessage().contains("Extreme soil temperature"));

            if (!alreadyAlerted) {
                Alert alert = Alert.builder()
                        .farm(farm)
                        .message(message)
                        .severity(AlertSeverity.WARNING)
                        .resolved(false)
                        .timestamp(LocalDateTime.now())
                        .build();
                alertRepository.save(alert);
            }
        }
    }

    @GetMapping("/farm/{farmId}/latest")
    public ResponseEntity<?> getLatestTelemetry(@PathVariable Long farmId) {
        User user = getAuthenticatedUser();
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found with id: " + farmId));

        if (!farm.getOwner().getId().equals(user.getId()) && user.getRole() != Role.ROLE_AGRONOMIST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Access Denied.");
        }

        List<Device> devices = deviceRepository.findByFarmId(farmId);
        List<Map<String, Object>> latestTelemetryList = new ArrayList<>();

        for (Device device : devices) {
            Optional<SensorData> latestData = sensorDataRepository.findFirstByDeviceIdOrderByTimestampDesc(device.getId());
            Map<String, Object> deviceTelemetry = new HashMap<>();
            deviceTelemetry.put("device", device);
            deviceTelemetry.put("telemetry", latestData.orElse(null));
            latestTelemetryList.add(deviceTelemetry);
        }

        return ResponseEntity.ok(latestTelemetryList);
    }

    @GetMapping("/device/{deviceId}/history")
    public ResponseEntity<?> getDeviceTelemetryHistory(@PathVariable Long deviceId) {
        User user = getAuthenticatedUser();
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found with id: " + deviceId));

        if (!device.getFarm().getOwner().getId().equals(user.getId()) && user.getRole() != Role.ROLE_AGRONOMIST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Access Denied.");
        }

        List<SensorData> history = sensorDataRepository.findByDeviceIdOrderByTimestampDesc(deviceId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/farm/{farmId}/alerts")
    public ResponseEntity<?> getActiveAlerts(@PathVariable Long farmId) {
        User user = getAuthenticatedUser();
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found with id: " + farmId));

        if (!farm.getOwner().getId().equals(user.getId()) && user.getRole() != Role.ROLE_AGRONOMIST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Access Denied.");
        }

        // Fetch unresolved alerts
        List<Alert> activeAlerts = alertRepository.findByFarmIdAndResolvedOrderByTimestampDesc(farmId, false);
        return ResponseEntity.ok(activeAlerts);
    }

    @PostMapping("/alerts/{alertId}/resolve")
    public ResponseEntity<?> resolveAlert(@PathVariable Long alertId) {
        User user = getAuthenticatedUser();
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found with id: " + alertId));

        if (!alert.getFarm().getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Access Denied.");
        }

        alert.setResolved(true);
        alertRepository.save(alert);
        return ResponseEntity.ok("Alert marked as resolved.");
    }

    @GetMapping("/farm/{farmId}/recommendations")
    public ResponseEntity<?> getCropRecommendations(@PathVariable Long farmId) {
        User user = getAuthenticatedUser();
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new RuntimeException("Farm not found with id: " + farmId));

        if (!farm.getOwner().getId().equals(user.getId()) && user.getRole() != Role.ROLE_AGRONOMIST) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Access Denied.");
        }

        List<Device> devices = deviceRepository.findByFarmId(farmId);
        double totalMoisture = 0.0;
        double totalNitrogen = 0.0;
        double totalPhosphorus = 0.0;
        double totalPotassium = 0.0;
        int activeNodeCount = 0;

        for (Device dev : devices) {
            if (dev.getType() == DeviceType.SOIL_NODE) {
                Optional<SensorData> latest = sensorDataRepository.findFirstByDeviceIdOrderByTimestampDesc(dev.getId());
                if (latest.isPresent()) {
                    SensorData data = latest.get();
                    totalMoisture += data.getMoisture();
                    totalNitrogen += data.getNitrogen();
                    totalPhosphorus += data.getPhosphorus();
                    totalPotassium += data.getPotassium();
                    activeNodeCount++;
                }
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("farmId", farmId);
        response.put("farmName", farm.getName());
        response.put("timestamp", LocalDateTime.now());

        if (activeNodeCount == 0) {
            response.put("cropSuitability", "No Soil Node Data");
            response.put("soilStatus", "No telemetry readings available yet from Soil Nodes.");
            response.put("actionRequired", "Deploy physical Soil Node IoT devices and ensure they are active and transmitting telemetry.");
            return ResponseEntity.ok(response);
        }

        double avgMoisture = totalMoisture / activeNodeCount;
        double avgN = totalNitrogen / activeNodeCount;
        double avgP = totalPhosphorus / activeNodeCount;
        double avgK = totalPotassium / activeNodeCount;

        response.put("averageMoisture", Math.round(avgMoisture * 10.0) / 10.0);
        response.put("averageNPK", String.format("N: %.1f, P: %.1f, K: %.1f", avgN, avgP, avgK));

        // Evaluate moisture status
        String moistureStatus;
        String moistureAction = "";
        if (avgMoisture < 35.0) {
            moistureStatus = "Soil is dry (Deficient)";
            moistureAction = "Trigger solenoid irrigation pump. Recommended duration: 45 minutes.";
        } else if (avgMoisture >= 35.0 && avgMoisture <= 70.0) {
            moistureStatus = "Soil moisture is optimal";
            moistureAction = "Maintain current automated sensor irrigation schedule.";
        } else {
            moistureStatus = "Soil is waterlogged (Oversaturated)";
            moistureAction = "Deactivate all automated valve irrigation immediately to prevent root asphyxiation.";
        }

        // Evaluate NPK Status
        List<String> deficiencies = new ArrayList<>();
        List<String> fertilizerActions = new ArrayList<>();

        if (avgN < 30.0) {
            deficiencies.add("Nitrogen (N)");
            fertilizerActions.add("Apply organic manure or nitrogen-rich chemical fertilizer (such as Urea or Ammonium Nitrate).");
        }
        if (avgP < 20.0) {
            deficiencies.add("Phosphorus (P)");
            fertilizerActions.add("Apply bone meal or rock phosphate / single superphosphate (SSP) to support root strength.");
        }
        if (avgK < 40.0) {
            deficiencies.add("Potassium (K)");
            fertilizerActions.add("Incorporate muriate of potash or potassium sulfate to enhance disease resistance.");
        }

        String soilStatus = deficiencies.isEmpty() 
                ? "Optimal soil fertility levels detected. " + moistureStatus + "."
                : "Deficient in: " + String.join(", ", deficiencies) + ". " + moistureStatus + ".";

        List<String> actions = new ArrayList<>();
        actions.add(moistureAction);
        actions.addAll(fertilizerActions);

        // Crop Suitability Suggestion
        String cropSuitability;
        if (avgMoisture >= 40.0 && avgN >= 40.0) {
            cropSuitability = "Maize (Corn), Leafy Greens (Cabbage, Spinach), and Rice (requires high water retention).";
        } else if (avgMoisture < 40.0 && avgK >= 35.0) {
            cropSuitability = "Drought-tolerant root crops: Cassava, Sorghum, Millet, and Sweet Potatoes.";
        } else {
            cropSuitability = "Legumes (Beans, Cowpeas, Soybeans) - highly recommended as they will also fix nitrogen back into the soil.";
        }

        response.put("soilStatus", soilStatus);
        response.put("actionRequired", String.join(" | ", actions));
        response.put("cropSuitability", cropSuitability);

        return ResponseEntity.ok(response);
    }
}
