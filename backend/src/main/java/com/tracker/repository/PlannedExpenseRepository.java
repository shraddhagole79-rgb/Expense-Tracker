package com.tracker.repository;

import com.tracker.entity.PlannedExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlannedExpenseRepository extends JpaRepository<PlannedExpense, Long> {
    List<PlannedExpense> findByUserIdOrderByExpectedDateAsc(Long userId);
}
