package com.tracker.repository;

import com.tracker.entity.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    List<Investment> findByUserId(Long userId);

    @Query("SELECT i.category, SUM(i.currentValue) FROM Investment i WHERE i.user.id = :userId GROUP BY i.category")
    List<Object[]> getAllocationSummary(@Param("userId") Long userId);
}
