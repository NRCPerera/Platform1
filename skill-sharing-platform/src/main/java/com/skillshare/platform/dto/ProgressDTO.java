package com.skillshare.platform.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgressDTO {
    private Long id;
    private String topic;
    private String completed;
    private String newSkills;
    private LocalDateTime createdAt;
    private String name;
}
