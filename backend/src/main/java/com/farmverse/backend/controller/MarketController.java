package com.farmverse.backend.controller;

import com.farmverse.backend.model.MarketPrice;
import com.farmverse.backend.repository.MarketPriceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/market-prices")
public class MarketController {

    private final MarketPriceRepository repository;

    public MarketController(MarketPriceRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<MarketPrice>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<MarketPrice> create(@RequestBody MarketPrice req) {
        if (req.getPriceDate() == null) req.setPriceDate(java.time.LocalDate.now());
        return ResponseEntity.ok(repository.save(req));
    }
}
