package com.tracker.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class InvestmentRequest {
    @NotBlank(message = "Asset name is required")
    private String assetName;

    @NotNull(message = "Invested amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    private BigDecimal investedAmount;

    @NotNull(message = "Current value is required")
    @DecimalMin(value = "0.00", message = "Value cannot be negative")
    private BigDecimal currentValue;

    @NotBlank(message = "Category is required")
    private String category;

    private String notes;
}
