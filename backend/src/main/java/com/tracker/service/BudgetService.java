package com.tracker.service;

import com.tracker.dto.BudgetRequest;
import com.tracker.entity.Budget;
import com.tracker.entity.User;
import com.tracker.repository.BudgetRepository;
import com.tracker.repository.ExpenseRepository;
import com.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<Budget> getAllBudgets() {
        return budgetRepository.findByUserId(getCurrentUser().getId());
    }

    public List<Budget> getBudgetsByMonthYear(Integer month, Integer year) {
        return budgetRepository.findByUserIdAndMonthAndYear(getCurrentUser().getId(), month, year);
    }

    public Budget createOrUpdateBudget(BudgetRequest request) {
        User user = getCurrentUser();
        Optional<Budget> existing = budgetRepository.findByUserIdAndCategoryAndMonthAndYear(
                user.getId(), request.getCategory(), request.getMonth(), request.getYear());

        Budget budget;
        if (existing.isPresent()) {
            budget = existing.get();
            budget.setMonthlyLimit(request.getMonthlyLimit());
        } else {
            budget = Budget.builder()
                    .category(request.getCategory())
                    .monthlyLimit(request.getMonthlyLimit())
                    .month(request.getMonth())
                    .year(request.getYear())
                    .user(user)
                    .build();
        }
        return budgetRepository.save(budget);
    }

    public void deleteBudget(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        budgetRepository.delete(budget);
    }

    public List<Map<String, Object>> getBudgetsWithSpending(Integer month, Integer year) {
        User user = getCurrentUser();
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month, year);
        List<Map<String, Object>> result = new ArrayList<>();

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);

        for (Budget budget : budgets) {
            BigDecimal spent = expenseRepository.getTotalByCategoryAndDateRange(
                    user.getId(), budget.getCategory(), start, end);

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("id", budget.getId());
            entry.put("category", budget.getCategory());
            entry.put("monthlyLimit", budget.getMonthlyLimit());
            entry.put("spent", spent);
            entry.put("remaining", budget.getMonthlyLimit().subtract(spent));
            entry.put("month", month);
            entry.put("year", year);
            result.add(entry);
        }
        return result;
    }
}
