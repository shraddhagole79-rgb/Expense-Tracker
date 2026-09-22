package com.tracker.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BudgetRequest {
    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Monthly limit is required")
    @DecimalMin(value = "0.01", message = "Limit must be positive")
    private BigDecimal monthlyLimit;

    @NotNull(message = "Month is required")
    @Min(1) @Max(12)
    private Integer month;

    @NotNull(message = "Year is required")
    private Integer year;
}
