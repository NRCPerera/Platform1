package com.skillshare.platform.repository;

import com.skillshare.platform.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
}