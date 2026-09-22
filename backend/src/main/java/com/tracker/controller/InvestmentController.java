package com.tracker.controller;

import com.tracker.dto.InvestmentRequest;
import com.tracker.entity.Investment;
import com.tracker.service.InvestmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/investments")
@RequiredArgsConstructor
public class InvestmentController {

    private final InvestmentService investmentService;

    @GetMapping
    public ResponseEntity<List<Investment>> getAll() {
        return ResponseEntity.ok(investmentService.getAll());
    }

    @PostMapping
    public ResponseEntity<Investment> add(@Valid @RequestBody InvestmentRequest request) {
        return ResponseEntity.ok(investmentService.add(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Investment> update(@PathVariable Long id,
                                              @Valid @RequestBody InvestmentRequest request) {
        return ResponseEntity.ok(investmentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        investmentService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<List<Map<String, Object>>> getAllocationSummary() {
        return ResponseEntity.ok(investmentService.getAllocationSummary());
    }
}
