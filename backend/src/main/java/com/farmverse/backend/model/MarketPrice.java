package com.farmverse.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "market_prices")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String commodity;
    private String marketMandi;
    private String state;
    private Double modalPrice; // INR per Quintal
    private Double minPrice;
    private Double maxPrice;
    private Double priceChangePercent;
    private LocalDate priceDate;
}
