package com.farmverse.backend.controller;

import com.farmverse.backend.model.Farm;
import com.farmverse.backend.model.IrrigationSchedule;
import com.farmverse.backend.model.User;
import com.farmverse.backend.repository.FarmRepository;
import com.farmverse.backend.repository.IrrigationScheduleRepository;
import com.farmverse.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/irrigation")
public class IrrigationController {

    private final IrrigationScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final FarmRepository farmRepository;

    public IrrigationController(IrrigationScheduleRepository scheduleRepository, UserRepository userRepository, FarmRepository farmRepository) {
        this.scheduleRepository = scheduleRepository;
        this.userRepository = userRepository;
        this.farmRepository = farmRepository;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<IrrigationSchedule>> getSchedules() {
        User user = currentUser();
        if (user != null) {
            List<IrrigationSchedule> list = scheduleRepository.findByFarmOwnerId(user.getId());
            if (!list.isEmpty()) return ResponseEntity.ok(list);
        }
        return ResponseEntity.ok(scheduleRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<IrrigationSchedule> create(@RequestBody IrrigationSchedule req) {
        User user = currentUser();
        if (req.getFarm() == null && user != null) {
            List<Farm> farms = farmRepository.findByOwnerId(user.getId());
            if (!farms.isEmpty()) req.setFarm(farms.get(0));
            else {
                List<Farm> all = farmRepository.findAll();
                if (!all.isEmpty()) req.setFarm(all.get(0));
            }
        }
        if (req.getActive() == null) req.setActive(true);
        return ResponseEntity.ok(scheduleRepository.save(req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        scheduleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
