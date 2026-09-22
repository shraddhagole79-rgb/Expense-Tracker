package com.tracker.service;

import com.tracker.dto.IncomeRequest;
import com.tracker.entity.Income;
import com.tracker.entity.User;
import com.tracker.repository.IncomeRepository;
import com.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<Income> getAllIncome() {
        return incomeRepository.findByUserIdOrderByDateDesc(getCurrentUser().getId());
    }

    public Income addIncome(IncomeRequest request) {
        Income income = Income.builder()
                .source(request.getSource())
                .amount(request.getAmount())
                .date(request.getDate())
                .notes(request.getNotes())
                .user(getCurrentUser())
                .build();
        return incomeRepository.save(income);
    }

    public Income updateIncome(Long id, IncomeRequest request) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Income not found"));

        if (!income.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        income.setSource(request.getSource());
        income.setAmount(request.getAmount());
        income.setDate(request.getDate());
        income.setNotes(request.getNotes());
        return incomeRepository.save(income);
    }

    public void deleteIncome(Long id) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Income not found"));

        if (!income.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        incomeRepository.delete(income);
    }
}
