package com.farmverse.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FarmerProfileUpdateRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;
}
