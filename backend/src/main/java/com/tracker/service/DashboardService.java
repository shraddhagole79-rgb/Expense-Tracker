package com.tracker.service;

import com.tracker.entity.Expense;
import com.tracker.entity.Income;
import com.tracker.entity.SavingsGoal;
import com.tracker.entity.User;
import com.tracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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
        
        List<Income> incomes = incomeRepository.findByUserIdOrderByDateDesc(userId);
        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(userId);
        List<SavingsGoal> savings = savingsGoalRepository.findByUserId(userId);

        BigDecimal totalIncome = incomes.stream()
                .map(Income::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = expenses.stream()
                .map(Expense::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSavings = savings.stream()
                .map(SavingsGoal::getCurrentAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

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

        transactions.sort((a, b) -> {
            LocalDate da = (LocalDate) a.get("date");
            LocalDate db = (LocalDate) b.get("date");
            if (da == null && db == null) return 0;
            if (da == null) return 1;
            if (db == null) return -1;
            return db.compareTo(da);
        });

        return transactions.size() > 10 ? transactions.subList(0, 10) : transactions;
    }

    public List<Map<String, Object>> getCategorySpending() {
        Long userId = getCurrentUser().getId();
        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(userId);
        
        Map<String, BigDecimal> catMap = new LinkedHashMap<>();
        for (Expense e : expenses) {
            String cat = (e.getCategory() != null && !e.getCategory().isBlank()) ? e.getCategory() : "Other";
            BigDecimal amt = e.getAmount() != null ? e.getAmount() : BigDecimal.ZERO;
            catMap.merge(cat, amt, BigDecimal::add);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        catMap.forEach((cat, amt) -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("category", cat);
            entry.put("amount", amt);
            result.add(entry);
        });
        return result;
    }

    public Map<String, List<Map<String, Object>>> getIncomeVsExpense() {
        Long userId = getCurrentUser().getId();
        List<Income> incomes = incomeRepository.findByUserIdOrderByDateDesc(userId);
        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(userId);

        Map<String, BigDecimal> incomeMap = new TreeMap<>();
        Map<String, BigDecimal> expenseMap = new TreeMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (Income i : incomes) {
            if (i.getDate() != null && i.getAmount() != null) {
                String month = i.getDate().format(formatter);
                incomeMap.merge(month, i.getAmount(), BigDecimal::add);
            }
        }
        for (Expense e : expenses) {
            if (e.getDate() != null && e.getAmount() != null) {
                String month = e.getDate().format(formatter);
                expenseMap.merge(month, e.getAmount(), BigDecimal::add);
            }
        }

        Set<String> allMonths = new TreeSet<>();
        allMonths.addAll(incomeMap.keySet());
        allMonths.addAll(expenseMap.keySet());

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
        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(userId);

        Map<LocalDate, BigDecimal> dailyMap = new TreeMap<>();
        for (Expense e : expenses) {
            if (e.getDate() != null && !e.getDate().isBefore(since) && e.getAmount() != null) {
                dailyMap.merge(e.getDate(), e.getAmount(), BigDecimal::add);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        dailyMap.forEach((date, amount) -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("date", date.toString());
            entry.put("amount", amount);
            result.add(entry);
        });
        return result;
    }
}
