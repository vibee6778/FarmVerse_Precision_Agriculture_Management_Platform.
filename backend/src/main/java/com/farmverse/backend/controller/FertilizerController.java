package com.farmverse.backend.controller;

import com.farmverse.backend.model.FertilizerRecommendation;
import com.farmverse.backend.repository.FertilizerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/fertilizers")
public class FertilizerController {

    private final FertilizerRepository repository;

    public FertilizerController(FertilizerRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<FertilizerRecommendation>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<FertilizerRecommendation> create(@RequestBody FertilizerRecommendation req) {
        if (req.getRecommendedDate() == null) {
            req.setRecommendedDate(java.time.LocalDate.now());
        }
        if (req.getStatus() == null) {
            req.setStatus("Scheduled");
        }
        return ResponseEntity.ok(repository.save(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FertilizerRecommendation> update(@PathVariable Long id, @RequestBody FertilizerRecommendation req) {
        req.setId(id);
        return ResponseEntity.ok(repository.save(req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
