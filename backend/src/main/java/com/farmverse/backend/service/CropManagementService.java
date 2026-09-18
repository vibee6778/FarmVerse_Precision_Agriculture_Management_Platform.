package com.farmverse.backend.service;

import com.farmverse.backend.dto.CropRequest;
import com.farmverse.backend.model.Crop;
import com.farmverse.backend.model.CropStatus;
import com.farmverse.backend.model.Farm;
import com.farmverse.backend.model.User;
import com.farmverse.backend.repository.CropRepository;
import com.farmverse.backend.repository.FarmRepository;
import com.farmverse.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CropManagementService {

    private final CropRepository cropRepository;
    private final FarmRepository farmRepository;
    private final UserRepository userRepository;

    public CropManagementService(
            CropRepository cropRepository,
            FarmRepository farmRepository,
            UserRepository userRepository) {
        this.cropRepository = cropRepository;
        this.farmRepository = farmRepository;
        this.userRepository = userRepository;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }

    public List<Crop> getMyCrops() {
        User user = currentUser();
        if (user.getRole() == com.farmverse.backend.model.Role.ROLE_ADMIN || user.getRole() == com.farmverse.backend.model.Role.ROLE_AGRONOMIST) {
            return cropRepository.findAll();
        }
        return cropRepository.findByFarmOwnerIdOrderBySowingDateDesc(user.getId());
    }

    public List<Crop> getFarmCrops(Long farmId) {
        ownedFarm(farmId);
        return cropRepository.findByFarmIdOrderBySowingDateDesc(farmId);
    }

    public Crop create(CropRequest request) {
        Farm farm = getOrCreateUserFarm(request.getFarmId());

        Crop crop = Crop.builder()
                .farm(farm)
                .name(request.getName())
                .variety(request.getVariety() != null ? request.getVariety() : "Standard Hybrid")
                .season(request.getSeason() != null ? request.getSeason() : "Kharif")
                .sowingDate(request.getSowingDate() != null ? request.getSowingDate() : java.time.LocalDate.now())
                .expectedHarvestDate(request.getExpectedHarvestDate() != null ? request.getExpectedHarvestDate() : java.time.LocalDate.now().plusMonths(3))
                .areaAcres(request.getAreaAcres() != null ? request.getAreaAcres() : 2.0)
                .status(request.getStatus() != null ? request.getStatus() : CropStatus.GROWING)
                .notes(request.getNotes() != null ? request.getNotes() : "Created via Crop Management")
                .build();

        return cropRepository.save(crop);
    }

    public Crop update(Long cropId, CropRequest request) {
        Crop crop = ownedCrop(cropId);
        Farm farm = ownedFarm(request.getFarmId());

        crop.setFarm(farm);
        crop.setName(request.getName());
        crop.setVariety(request.getVariety());
        crop.setSeason(request.getSeason());
        crop.setSowingDate(request.getSowingDate());
        crop.setExpectedHarvestDate(request.getExpectedHarvestDate());
        crop.setAreaAcres(request.getAreaAcres());
        crop.setStatus(request.getStatus());
        crop.setNotes(request.getNotes());

        return cropRepository.save(crop);
    }

    public void delete(Long cropId) {
        cropRepository.delete(ownedCrop(cropId));
    }

    public Map<String, Object> dashboard() {
        Long farmerId = currentUser().getId();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalCrops", cropRepository.findByFarmOwnerIdOrderBySowingDateDesc(farmerId).size());
        result.put("planned", cropRepository.countByFarmOwnerIdAndStatus(farmerId, CropStatus.PLANNED));
        result.put("sown", cropRepository.countByFarmOwnerIdAndStatus(farmerId, CropStatus.SOWN));
        result.put("growing", cropRepository.countByFarmOwnerIdAndStatus(farmerId, CropStatus.GROWING));
        result.put("harvestReady", cropRepository.countByFarmOwnerIdAndStatus(farmerId, CropStatus.HARVEST_READY));
        result.put("harvested", cropRepository.countByFarmOwnerIdAndStatus(farmerId, CropStatus.HARVESTED));
        result.put("failed", cropRepository.countByFarmOwnerIdAndStatus(farmerId, CropStatus.FAILED));
        return result;
    }

    private Farm getOrCreateUserFarm(Long farmId) {
        User user = currentUser();
        if (farmId != null) {
            return ownedFarm(farmId);
        }
        List<Farm> userFarms = farmRepository.findByOwnerId(user.getId());
        if (!userFarms.isEmpty()) {
            return userFarms.get(0);
        }
        throw new IllegalArgumentException("No farms found for current user. Please create a farm first.");
    }

    private Farm ownedFarm(Long farmId) {
        return farmRepository.findById(farmId)
                .filter(f -> f.getOwner().getId().equals(currentUser().getId()))
                .orElseThrow(() -> new IllegalArgumentException("Farm not found or access denied"));
    }

    private Crop ownedCrop(Long cropId) {
        return cropRepository.findById(cropId)
                .filter(c -> c.getFarm().getOwner().getId().equals(currentUser().getId()))
                .orElseThrow(() -> new IllegalArgumentException("Crop not found or access denied"));
    }
}
