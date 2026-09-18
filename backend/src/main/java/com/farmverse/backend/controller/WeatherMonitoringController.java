package com.farmverse.backend.controller;

import com.farmverse.backend.model.WeatherObservation;
import com.farmverse.backend.service.WeatherMonitoringService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/weather")
public class WeatherMonitoringController {

    private final WeatherMonitoringService service;

    public WeatherMonitoringController(WeatherMonitoringService service) {
        this.service = service;
    }

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> current(
            @RequestParam double latitude,
            @RequestParam double longitude) {
        return ResponseEntity.ok(service.getCurrentWeather(latitude, longitude));
    }

    @GetMapping("/farm/{farmId}/current")
    public ResponseEntity<Map<String, Object>> farmCurrent(@PathVariable Long farmId) {
        return ResponseEntity.ok(service.getFarmCurrentWeather(farmId));
    }

    @GetMapping("/farm/{farmId}/history")
    public ResponseEntity<List<WeatherObservation>> history(@PathVariable Long farmId) {
        return ResponseEntity.ok(service.history(farmId));
    }

    @PostMapping("/farm/{farmId}/observations")
    public ResponseEntity<WeatherObservation> saveObservation(
            @PathVariable Long farmId,
            @Valid @RequestBody WeatherObservation observation) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.saveObservation(farmId, observation));
    }
}
