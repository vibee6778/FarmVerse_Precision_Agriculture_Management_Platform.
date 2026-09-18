package com.farmverse.backend.controller;

import com.farmverse.backend.dto.FarmRequest;
import com.farmverse.backend.dto.FarmerProfileResponse;
import com.farmverse.backend.dto.FarmerProfileUpdateRequest;
import com.farmverse.backend.model.Farm;
import com.farmverse.backend.service.FarmerManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/farmer-management")
public class FarmerManagementController {

    private final FarmerManagementService service;

    public FarmerManagementController(FarmerManagementService service) {
        this.service = service;
    }

    @GetMapping("/profile")
    public ResponseEntity<FarmerProfileResponse> getProfile() {
        return ResponseEntity.ok(service.getProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<FarmerProfileResponse> updateProfile(
            @Valid @RequestBody FarmerProfileUpdateRequest request) {
        return ResponseEntity.ok(service.updateProfile(request));
    }

    @GetMapping("/farms")
    public ResponseEntity<List<Farm>> getFarms() {
        return ResponseEntity.ok(service.getFarms());
    }

    @PostMapping("/farms")
    public ResponseEntity<Farm> createFarm(@Valid @RequestBody FarmRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createFarm(request));
    }

    @PutMapping("/farms/{farmId}")
    public ResponseEntity<Farm> updateFarm(
            @PathVariable Long farmId,
            @Valid @RequestBody FarmRequest request) {
        return ResponseEntity.ok(service.updateFarm(farmId, request));
    }

    @DeleteMapping("/farms/{farmId}")
    public ResponseEntity<Void> deleteFarm(@PathVariable Long farmId) {
        service.deleteFarm(farmId);
        return ResponseEntity.noContent().build();
    }
}
