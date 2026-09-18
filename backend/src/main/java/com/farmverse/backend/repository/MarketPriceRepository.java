package com.farmverse.backend.repository;

import com.farmverse.backend.model.MarketPrice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketPriceRepository extends JpaRepository<MarketPrice, Long> {
}
