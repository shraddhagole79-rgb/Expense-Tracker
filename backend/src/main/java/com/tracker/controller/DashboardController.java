package com.tracker.controller;

import com.tracker.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Map<String, Object>>> getRecentTransactions() {
        return ResponseEntity.ok(dashboardService.getRecentTransactions());
    }

    @GetMapping("/charts/category-spending")
    public ResponseEntity<List<Map<String, Object>>> getCategorySpending() {
        return ResponseEntity.ok(dashboardService.getCategorySpending());
    }

    @GetMapping("/charts/income-vs-expense")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getIncomeVsExpense() {
        return ResponseEntity.ok(dashboardService.getIncomeVsExpense());
    }

    @GetMapping("/charts/daily-trend")
    public ResponseEntity<List<Map<String, Object>>> getDailyTrend() {
        return ResponseEntity.ok(dashboardService.getDailyTrend());
    }
}
