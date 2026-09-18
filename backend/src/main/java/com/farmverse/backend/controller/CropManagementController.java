package com.farmverse.backend.controller;

import com.farmverse.backend.dto.CropRequest;
import com.farmverse.backend.model.Crop;
import com.farmverse.backend.service.CropManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/crop-management")
public class CropManagementController {

    private final CropManagementService service;

    public CropManagementController(CropManagementService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Crop>> getMyCrops() {
        return ResponseEntity.ok(service.getMyCrops());
    }

    @GetMapping("/farm/{farmId}")
    public ResponseEntity<List<Crop>> getFarmCrops(@PathVariable Long farmId) {
        return ResponseEntity.ok(service.getFarmCrops(farmId));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(service.dashboard());
    }

    @PostMapping
    public ResponseEntity<Crop> create(@Valid @RequestBody CropRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{cropId}")
    public ResponseEntity<Crop> update(
            @PathVariable Long cropId,
            @Valid @RequestBody CropRequest request) {
        return ResponseEntity.ok(service.update(cropId, request));
    }

    @DeleteMapping("/{cropId}")
    public ResponseEntity<Void> delete(@PathVariable Long cropId) {
        service.delete(cropId);
        return ResponseEntity.noContent().build();
    }
}
