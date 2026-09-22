package com.tracker.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SavingsGoalRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "0.01", message = "Target amount must be positive")
    private BigDecimal targetAmount;

    private LocalDate deadline;
}
