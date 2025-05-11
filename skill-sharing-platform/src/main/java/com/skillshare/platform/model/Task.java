package com.skillshare.platform.model;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private boolean completed;
    private LocalDateTime dueDate;
    private LocalDateTime completedAt;

    @ManyToOne
    @JoinColumn(name = "learning_plan_id")
    @JsonIgnore
    private LearningPlan learningPlan;
}