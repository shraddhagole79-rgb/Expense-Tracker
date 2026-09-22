package com.tracker.controller;

import com.tracker.dto.ContributionRequest;
import com.tracker.dto.SavingsGoalRequest;
import com.tracker.entity.SavingsContribution;
import com.tracker.entity.SavingsGoal;
import com.tracker.service.SavingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/savings")
@RequiredArgsConstructor
public class SavingsController {

    private final SavingsService savingsService;

    @GetMapping
    public ResponseEntity<List<SavingsGoal>> getAll() {
        return ResponseEntity.ok(savingsService.getAllGoals());
    }

    @PostMapping
    public ResponseEntity<SavingsGoal> create(@Valid @RequestBody SavingsGoalRequest request) {
        return ResponseEntity.ok(savingsService.createGoal(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavingsGoal> update(@PathVariable Long id, @Valid @RequestBody SavingsGoalRequest request) {
        return ResponseEntity.ok(savingsService.updateGoal(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        savingsService.deleteGoal(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/contribute")
    public ResponseEntity<SavingsContribution> contribute(@PathVariable Long id,
                                                           @Valid @RequestBody ContributionRequest request) {
        return ResponseEntity.ok(savingsService.addContribution(id, request));
    }

    @GetMapping("/{id}/contributions")
    public ResponseEntity<List<SavingsContribution>> getContributions(@PathVariable Long id) {
        return ResponseEntity.ok(savingsService.getContributions(id));
    }
}
