package com.farmverse.backend.controller;

import com.farmverse.backend.model.PestRecord;
import com.farmverse.backend.repository.PestRecordRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/pests")
public class PestController {

    private final PestRecordRepository repository;

    public PestController(PestRecordRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<PestRecord>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<PestRecord> create(@RequestBody PestRecord req) {
        if (req.getDetectedDate() == null) req.setDetectedDate(LocalDate.now());
        if (req.getStatus() == null) req.setStatus("Active");
        return ResponseEntity.ok(repository.save(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PestRecord> update(@PathVariable Long id, @RequestBody PestRecord req) {
        req.setId(id);
        return ResponseEntity.ok(repository.save(req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
