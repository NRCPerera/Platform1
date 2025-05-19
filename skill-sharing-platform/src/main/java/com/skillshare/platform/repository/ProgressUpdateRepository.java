package com.skillshare.platform.repository;

import com.skillshare.platform.model.ProgressUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProgressUpdateRepository extends JpaRepository<ProgressUpdate, Long> {

    @Query("SELECT p FROM ProgressUpdate p WHERE p.user.id = :userId OR p.visibility = :visibility")
    List<ProgressUpdate> findByUserIdOrVisibility(@Param("userId") Long userId, @Param("visibility") ProgressUpdate.Visibility visibility);

    List<ProgressUpdate> findByVisibility(ProgressUpdate.Visibility visibility);
}