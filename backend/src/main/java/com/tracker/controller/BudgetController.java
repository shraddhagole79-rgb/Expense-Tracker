package com.tracker.controller;

import com.tracker.dto.BudgetRequest;
import com.tracker.entity.Budget;
import com.tracker.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) Integer month,
                                     @RequestParam(required = false) Integer year) {
        if (month != null && year != null) {
            return ResponseEntity.ok(budgetService.getBudgetsWithSpending(month, year));
        }
        return ResponseEntity.ok(budgetService.getAllBudgets());
    }

    @PostMapping
    public ResponseEntity<Budget> create(@Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.createOrUpdateBudget(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.ok().build();
    }
}
