package com.tracker.service;

import com.tracker.dto.ContributionRequest;
import com.tracker.dto.SavingsGoalRequest;
import com.tracker.entity.SavingsContribution;
import com.tracker.entity.SavingsGoal;
import com.tracker.entity.User;
import com.tracker.repository.SavingsContributionRepository;
import com.tracker.repository.SavingsGoalRepository;
import com.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SavingsService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final SavingsContributionRepository contributionRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<SavingsGoal> getAllGoals() {
        return savingsGoalRepository.findByUserId(getCurrentUser().getId());
    }

    public SavingsGoal createGoal(SavingsGoalRequest request) {
        SavingsGoal goal = SavingsGoal.builder()
                .name(request.getName())
                .targetAmount(request.getTargetAmount())
                .deadline(request.getDeadline())
                .user(getCurrentUser())
                .build();
        return savingsGoalRepository.save(goal);
    }

    public SavingsGoal updateGoal(Long id, SavingsGoalRequest request) {
        SavingsGoal goal = savingsGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));

        if (!goal.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        goal.setName(request.getName());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setDeadline(request.getDeadline());
        return savingsGoalRepository.save(goal);
    }

    public void deleteGoal(Long id) {
        SavingsGoal goal = savingsGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));

        if (!goal.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        savingsGoalRepository.delete(goal);
    }

    @Transactional
    public SavingsContribution addContribution(Long goalId, ContributionRequest request) {
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));

        if (!goal.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        SavingsContribution contribution = SavingsContribution.builder()
                .amount(request.getAmount())
                .date(LocalDate.now())
                .savingsGoal(goal)
                .build();

        goal.setCurrentAmount(goal.getCurrentAmount().add(request.getAmount()));
        savingsGoalRepository.save(goal);

        return contributionRepository.save(contribution);
    }

    public List<SavingsContribution> getContributions(Long goalId) {
        return contributionRepository.findBySavingsGoalIdOrderByDateDesc(goalId);
    }
}
