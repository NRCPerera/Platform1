package com.skillshare.platform.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LearningPlanDTO {
    private Long id;
    private String topic;
    private String resources;
    private String timeline;
    private LocalDateTime createdAt;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean extended;
    private String name;
    private List<TaskDTO> tasks;
}