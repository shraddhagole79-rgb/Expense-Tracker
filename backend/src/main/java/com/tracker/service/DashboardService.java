package com.tracker.service;

import com.tracker.entity.User;
import com.tracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Map<String, Object> getSummary() {
        Long userId = getCurrentUser().getId();
        Map<String, Object> summary = new LinkedHashMap<>();
        BigDecimal totalIncome = incomeRepository.getTotalIncomeByUserId(userId);
        BigDecimal totalExpenses = expenseRepository.getTotalExpensesByUserId(userId);
        BigDecimal totalSavings = savingsGoalRepository.getTotalSavingsByUserId(userId);
        BigDecimal netBalance = totalIncome.subtract(totalExpenses);

        summary.put("totalIncome", totalIncome);
        summary.put("totalExpenses", totalExpenses);
        summary.put("totalSavings", totalSavings);
        summary.put("netBalance", netBalance);
        return summary;
    }

    public List<Map<String, Object>> getRecentTransactions() {
        Long userId = getCurrentUser().getId();
        List<Map<String, Object>> transactions = new ArrayList<>();

        expenseRepository.findTop10ByUserIdOrderByDateDesc(userId).forEach(e -> {
            Map<String, Object> t = new LinkedHashMap<>();
            t.put("id", e.getId());
            t.put("type", "expense");
            t.put("title", e.getTitle());
            t.put("amount", e.getAmount());
            t.put("date", e.getDate());
            t.put("category", e.getCategory());
            transactions.add(t);
        });

        incomeRepository.findTop10ByUserIdOrderByDateDesc(userId).forEach(i -> {
            Map<String, Object> t = new LinkedHashMap<>();
            t.put("id", i.getId());
            t.put("type", "income");
            t.put("title", i.getSource());
            t.put("amount", i.getAmount());
            t.put("date", i.getDate());
            t.put("category", "Income");
            transactions.add(t);
        });

        transactions.sort((a, b) -> ((LocalDate) b.get("date")).compareTo((LocalDate) a.get("date")));
        return transactions.size() > 10 ? transactions.subList(0, 10) : transactions;
    }

    public List<Map<String, Object>> getCategorySpending() {
        Long userId = getCurrentUser().getId();
        List<Object[]> data = expenseRepository.getCategoryWiseSpending(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : data) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("category", row[0]);
            entry.put("amount", row[1]);
            result.add(entry);
        }
        return result;
    }

    public Map<String, List<Map<String, Object>>> getIncomeVsExpense() {
        Long userId = getCurrentUser().getId();
        List<Object[]> monthlyIncome = incomeRepository.getMonthlyIncome(userId);
        List<Object[]> monthlyExpenses = expenseRepository.getMonthlyExpenses(userId);

        Set<String> allMonths = new TreeSet<>();
        Map<String, BigDecimal> incomeMap = new LinkedHashMap<>();
        Map<String, BigDecimal> expenseMap = new LinkedHashMap<>();

        for (Object[] row : monthlyIncome) {
            String month = (String) row[0];
            allMonths.add(month);
            incomeMap.put(month, (BigDecimal) row[1]);
        }
        for (Object[] row : monthlyExpenses) {
            String month = (String) row[0];
            allMonths.add(month);
            expenseMap.put(month, (BigDecimal) row[1]);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (String month : allMonths) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", month);
            entry.put("income", incomeMap.getOrDefault(month, BigDecimal.ZERO));
            entry.put("expense", expenseMap.getOrDefault(month, BigDecimal.ZERO));
            result.add(entry);
        }

        Map<String, List<Map<String, Object>>> wrapper = new LinkedHashMap<>();
        wrapper.put("data", result);
        return wrapper;
    }

    public List<Map<String, Object>> getDailyTrend() {
        Long userId = getCurrentUser().getId();
        LocalDate since = LocalDate.now().minusDays(30);
        List<Object[]> data = expenseRepository.getDailySpending(userId, since);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : data) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("date", row[0]);
            entry.put("amount", row[1]);
            result.add(entry);
        }
        return result;
    }
}
