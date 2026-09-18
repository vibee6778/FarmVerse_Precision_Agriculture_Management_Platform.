package com.farmverse.backend.service;

import com.farmverse.backend.dto.FarmRequest;
import com.farmverse.backend.dto.FarmerProfileResponse;
import com.farmverse.backend.dto.FarmerProfileUpdateRequest;
import com.farmverse.backend.model.Farm;
import com.farmverse.backend.model.User;
import com.farmverse.backend.repository.AlertRepository;
import com.farmverse.backend.repository.DeviceRepository;
import com.farmverse.backend.repository.FarmRepository;
import com.farmverse.backend.repository.SensorDataRepository;
import com.farmverse.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FarmerManagementService {

    private final UserRepository userRepository;
    private final FarmRepository farmRepository;
    private final DeviceRepository deviceRepository;
    private final SensorDataRepository sensorDataRepository;
    private final AlertRepository alertRepository;

    public FarmerManagementService(
            UserRepository userRepository,
            FarmRepository farmRepository,
            DeviceRepository deviceRepository,
            SensorDataRepository sensorDataRepository,
            AlertRepository alertRepository) {
        this.userRepository = userRepository;
        this.farmRepository = farmRepository;
        this.deviceRepository = deviceRepository;
        this.sensorDataRepository = sensorDataRepository;
        this.alertRepository = alertRepository;
    }

    public User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated farmer was not found"));
    }

    public FarmerProfileResponse getProfile() {
        User user = currentUser();
        return FarmerProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .farmCount(farmRepository.findByOwnerId(user.getId()).size())
                .build();
    }

    public FarmerProfileResponse updateProfile(FarmerProfileUpdateRequest request) {
        User user = currentUser();

        userRepository.findByEmail(request.getEmail())
                .filter(existing -> !existing.getId().equals(user.getId()))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Email is already in use");
                });

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        userRepository.save(user);

        return getProfile();
    }

    public List<Farm> getFarms() {
        User user = currentUser();
        if (user.getRole() == com.farmverse.backend.model.Role.ROLE_AGRONOMIST || user.getRole() == com.farmverse.backend.model.Role.ROLE_ADMIN) {
            return farmRepository.findAll();
        }
        return farmRepository.findByOwnerId(user.getId());
    }

    public Farm createFarm(FarmRequest request) {
        User user = currentUser();
        if (user.getRole() == com.farmverse.backend.model.Role.ROLE_AGRONOMIST) {
            throw new IllegalArgumentException("Access Denied: Agronomists are not permitted to register or create farm land property records.");
        }
        Farm farm = Farm.builder()
                .name(request.getName())
                .location(request.getLocation())
                .sizeAcres(request.getSizeAcres())
                .soilType(request.getSoilType())
                .owner(user)
                .build();
        return farmRepository.save(farm);
    }

    public Farm updateFarm(Long farmId, FarmRequest request) {
        User user = currentUser();
        if (user.getRole() == com.farmverse.backend.model.Role.ROLE_AGRONOMIST) {
            throw new IllegalArgumentException("Access Denied: Agronomists are not permitted to edit farm land property records.");
        }
        Farm farm = ownedOrAdminFarm(farmId);
        farm.setName(request.getName());
        farm.setLocation(request.getLocation());
        farm.setSizeAcres(request.getSizeAcres());
        farm.setSoilType(request.getSoilType());
        return farmRepository.save(farm);
    }

    @Transactional
    public void deleteFarm(Long farmId) {
        User user = currentUser();
        if (user.getRole() == com.farmverse.backend.model.Role.ROLE_AGRONOMIST) {
            throw new IllegalArgumentException("Access Denied: Agronomists are not permitted to delete farm land property records.");
        }
        if (user.getRole() != com.farmverse.backend.model.Role.ROLE_ADMIN) {
            // Standard farmers cannot delete records of other farmers
            Farm f = ownedOrAdminFarm(farmId);
        }
        Farm farm = ownedOrAdminFarm(farmId);

        sensorDataRepository.deleteAll(sensorDataRepository.findByDeviceFarmIdOrderByTimestampDesc(farmId));
        deviceRepository.deleteAll(deviceRepository.findByFarmId(farmId));
        alertRepository.deleteAll(alertRepository.findByFarmIdOrderByTimestampDesc(farmId));
        farmRepository.delete(farm);
    }

    public Farm ownedOrAdminFarm(Long farmId) {
        User user = currentUser();
        return farmRepository.findById(farmId)
                .filter(f -> user.getRole() == com.farmverse.backend.model.Role.ROLE_ADMIN || f.getOwner().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Farm not found or access denied: You do not have permission to modify this record."));
    }
}
