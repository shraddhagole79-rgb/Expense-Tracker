package com.tracker.repository;

import com.tracker.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserIdOrderByDateDesc(Long userId);
    List<Expense> findByUserIdAndCategory(Long userId, String category);
    List<Expense> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId")
    BigDecimal getTotalExpensesByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId AND e.category = :category AND e.date BETWEEN :start AND :end")
    BigDecimal getTotalByCategoryAndDateRange(@Param("userId") Long userId, @Param("category") String category, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId GROUP BY e.category")
    List<Object[]> getCategoryWiseSpending(@Param("userId") Long userId);

    @Query("SELECT FUNCTION('strftime', '%Y-%m', e.date), SUM(e.amount) FROM Expense e WHERE e.user.id = :userId GROUP BY FUNCTION('strftime', '%Y-%m', e.date) ORDER BY FUNCTION('strftime', '%Y-%m', e.date)")
    List<Object[]> getMonthlyExpenses(@Param("userId") Long userId);

    List<Expense> findTop10ByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT e.date, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.date >= :since GROUP BY e.date ORDER BY e.date")
    List<Object[]> getDailySpending(@Param("userId") Long userId, @Param("since") LocalDate since);
}
