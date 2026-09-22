package com.tracker.service;

import com.tracker.dto.InvestmentRequest;
import com.tracker.entity.Investment;
import com.tracker.entity.User;
import com.tracker.repository.InvestmentRepository;
import com.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class InvestmentService {

    private final InvestmentRepository investmentRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<Investment> getAll() {
        return investmentRepository.findByUserId(getCurrentUser().getId());
    }

    public Investment add(InvestmentRequest request) {
        Investment investment = Investment.builder()
                .assetName(request.getAssetName())
                .investedAmount(request.getInvestedAmount())
                .currentValue(request.getCurrentValue())
                .category(request.getCategory())
                .notes(request.getNotes())
                .user(getCurrentUser())
                .build();
        return investmentRepository.save(investment);
    }

    public Investment update(Long id, InvestmentRequest request) {
        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Investment not found"));

        if (!investment.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        investment.setAssetName(request.getAssetName());
        investment.setInvestedAmount(request.getInvestedAmount());
        investment.setCurrentValue(request.getCurrentValue());
        investment.setCategory(request.getCategory());
        investment.setNotes(request.getNotes());
        return investmentRepository.save(investment);
    }

    public void delete(Long id) {
        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Investment not found"));

        if (!investment.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        investmentRepository.delete(investment);
    }

    public List<Map<String, Object>> getAllocationSummary() {
        List<Object[]> data = investmentRepository.getAllocationSummary(getCurrentUser().getId());
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : data) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("category", row[0]);
            entry.put("totalValue", row[1]);
            result.add(entry);
        }
        return result;
    }
}
