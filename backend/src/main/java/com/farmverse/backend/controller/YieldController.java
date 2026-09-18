package com.farmverse.backend.controller;

import com.farmverse.backend.model.YieldPrediction;
import com.farmverse.backend.repository.YieldPredictionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/yield-predictions")
public class YieldController {

    private final YieldPredictionRepository repository;

    public YieldController(YieldPredictionRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<YieldPrediction>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<YieldPrediction> create(@RequestBody YieldPrediction req) {
        return ResponseEntity.ok(repository.save(req));
    }
}
