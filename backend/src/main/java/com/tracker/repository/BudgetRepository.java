package com.tracker.repository;

import com.tracker.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserId(Long userId);
    List<Budget> findByUserIdAndMonthAndYear(Long userId, Integer month, Integer year);
    Optional<Budget> findByUserIdAndCategoryAndMonthAndYear(Long userId, String category, Integer month, Integer year);
}
