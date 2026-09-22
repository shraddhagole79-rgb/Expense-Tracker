package com.tracker.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "investments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Investment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String assetName;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal investedAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal currentValue;

    @Column(nullable = false)
    private String category;

    private String notes;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
