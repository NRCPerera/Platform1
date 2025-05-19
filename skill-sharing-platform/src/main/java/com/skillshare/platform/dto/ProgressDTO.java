package com.skillshare.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgressDTO {
    private Long id;
    private String title;
    private String topic;
    private String description;
    private String status;
    private String skillLevel;
    private List<String> attachments = new ArrayList<>();
    private String visibility;
    private Set<String> tags = new HashSet<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String name;
}