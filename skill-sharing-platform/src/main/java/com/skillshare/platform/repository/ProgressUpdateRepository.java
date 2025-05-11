package com.skillshare.platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.skillshare.platform.model.ProgressUpdate;

public interface ProgressUpdateRepository extends JpaRepository<ProgressUpdate, Long> {
}