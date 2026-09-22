package com.tracker.service;

import com.tracker.dto.ExpenseRequest;
import com.tracker.entity.Expense;
import com.tracker.entity.User;
import com.tracker.repository.ExpenseRepository;
import com.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findByUserIdOrderByDateDesc(getCurrentUser().getId());
    }

    public List<Expense> getExpensesByCategory(String category) {
        return expenseRepository.findByUserIdAndCategory(getCurrentUser().getId(), category);
    }

    public Expense addExpense(ExpenseRequest request) {
        Expense expense = Expense.builder()
                .title(request.getTitle())
                .amount(request.getAmount())
                .date(request.getDate())
                .category(request.getCategory())
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .user(getCurrentUser())
                .build();
        return expenseRepository.save(expense);
    }

    public Expense updateExpense(Long id, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());
        expense.setCategory(request.getCategory());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setNotes(request.getNotes());
        return expenseRepository.save(expense);
    }

    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        expenseRepository.delete(expense);
    }
}
