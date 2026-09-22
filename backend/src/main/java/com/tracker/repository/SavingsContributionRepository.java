package com.tracker.repository;

import com.tracker.entity.SavingsContribution;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SavingsContributionRepository extends JpaRepository<SavingsContribution, Long> {
    List<SavingsContribution> findBySavingsGoalIdOrderByDateDesc(Long savingsGoalId);
}
