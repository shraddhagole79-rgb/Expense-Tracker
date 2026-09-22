package com.tracker.controller;

import com.tracker.dto.ExpenseRequest;
import com.tracker.entity.Expense;
import com.tracker.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<Expense>> getAll(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(expenseService.getExpensesByCategory(category));
        }
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @PostMapping
    public ResponseEntity<Expense> add(@Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.addExpense(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> update(@PathVariable Long id, @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.updateExpense(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok().build();
    }
}
