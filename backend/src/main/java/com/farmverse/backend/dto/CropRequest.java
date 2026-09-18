package com.farmverse.backend.dto;

import com.farmverse.backend.model.CropStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CropRequest {
    private Long farmId;

    @NotBlank
    private String name;

    private String variety;
    private String season;
    private LocalDate sowingDate;
    private LocalDate expectedHarvestDate;

    @NotNull
    private Double areaAcres;

    @NotNull
    private CropStatus status;

    private String notes;
}
