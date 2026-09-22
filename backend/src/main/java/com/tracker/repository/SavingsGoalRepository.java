package com.tracker.repository;

import com.tracker.entity.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {
    List<SavingsGoal> findByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(sg.currentAmount), 0) FROM SavingsGoal sg WHERE sg.user.id = :userId")
    BigDecimal getTotalSavingsByUserId(@Param("userId") Long userId);
}
