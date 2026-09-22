package com.tracker.repository;

import com.tracker.entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE i.user.id = :userId")
    BigDecimal getTotalIncomeByUserId(@Param("userId") Long userId);

    @Query("SELECT FUNCTION('strftime', '%Y-%m', i.date), SUM(i.amount) FROM Income i WHERE i.user.id = :userId GROUP BY FUNCTION('strftime', '%Y-%m', i.date) ORDER BY FUNCTION('strftime', '%Y-%m', i.date)")
    List<Object[]> getMonthlyIncome(@Param("userId") Long userId);

    List<Income> findTop10ByUserIdOrderByDateDesc(Long userId);
}
