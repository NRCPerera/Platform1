package com.skillshare.platform.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskDTO {
    private Long id;
    private String description;
    private boolean completed;
    private LocalDateTime dueDate;
    private LocalDateTime completedAt;
}