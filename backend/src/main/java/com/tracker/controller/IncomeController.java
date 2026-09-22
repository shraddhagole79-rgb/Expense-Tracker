package com.tracker.controller;

import com.tracker.dto.IncomeRequest;
import com.tracker.entity.Income;
import com.tracker.service.IncomeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/income")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    @GetMapping
    public ResponseEntity<List<Income>> getAll() {
        return ResponseEntity.ok(incomeService.getAllIncome());
    }

    @PostMapping
    public ResponseEntity<Income> add(@Valid @RequestBody IncomeRequest request) {
        return ResponseEntity.ok(incomeService.addIncome(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Income> update(@PathVariable Long id, @Valid @RequestBody IncomeRequest request) {
        return ResponseEntity.ok(incomeService.updateIncome(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        incomeService.deleteIncome(id);
        return ResponseEntity.ok().build();
    }
}
