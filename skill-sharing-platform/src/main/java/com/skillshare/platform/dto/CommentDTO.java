package com.skillshare.platform.dto;

import java.time.LocalDateTime;

import com.skillshare.platform.model.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentDTO {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private User user;

    // Constructors, getters, and setters
}