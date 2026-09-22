package com.tracker.service;

import com.tracker.dto.PlannedExpenseRequest;
import com.tracker.entity.PlannedExpense;
import com.tracker.entity.User;
import com.tracker.repository.PlannedExpenseRepository;
import com.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlannedExpenseService {

    private final PlannedExpenseRepository plannedExpenseRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<PlannedExpense> getAll() {
        return plannedExpenseRepository.findByUserIdOrderByExpectedDateAsc(getCurrentUser().getId());
    }

    public PlannedExpense add(PlannedExpenseRequest request) {
        PlannedExpense pe = PlannedExpense.builder()
                .title(request.getTitle())
                .amount(request.getAmount())
                .expectedDate(request.getExpectedDate())
                .category(request.getCategory())
                .notes(request.getNotes())
                .user(getCurrentUser())
                .build();
        return plannedExpenseRepository.save(pe);
    }

    public PlannedExpense update(Long id, PlannedExpenseRequest request) {
        PlannedExpense pe = plannedExpenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Planned expense not found"));

        if (!pe.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        pe.setTitle(request.getTitle());
        pe.setAmount(request.getAmount());
        pe.setExpectedDate(request.getExpectedDate());
        pe.setCategory(request.getCategory());
        pe.setNotes(request.getNotes());
        return plannedExpenseRepository.save(pe);
    }

    public void delete(Long id) {
        PlannedExpense pe = plannedExpenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Planned expense not found"));

        if (!pe.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        plannedExpenseRepository.delete(pe);
    }
}
