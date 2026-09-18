package com.farmverse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FarmRequest {
    @NotBlank
    private String name;

    private String location;

    @NotNull
    private Double sizeAcres;

    private String soilType;
}
