package com.tracker.controller;

import com.tracker.dto.PlannedExpenseRequest;
import com.tracker.entity.PlannedExpense;
import com.tracker.service.PlannedExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planned-expenses")
@RequiredArgsConstructor
public class PlannedExpenseController {

    private final PlannedExpenseService plannedExpenseService;

    @GetMapping
    public ResponseEntity<List<PlannedExpense>> getAll() {
        return ResponseEntity.ok(plannedExpenseService.getAll());
    }

    @PostMapping
    public ResponseEntity<PlannedExpense> add(@Valid @RequestBody PlannedExpenseRequest request) {
        return ResponseEntity.ok(plannedExpenseService.add(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlannedExpense> update(@PathVariable Long id,
                                                  @Valid @RequestBody PlannedExpenseRequest request) {
        return ResponseEntity.ok(plannedExpenseService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        plannedExpenseService.delete(id);
        return ResponseEntity.ok().build();
    }
}
