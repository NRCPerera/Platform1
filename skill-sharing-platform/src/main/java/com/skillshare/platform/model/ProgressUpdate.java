package com.skillshare.platform.model;

import lombok.Data;
import lombok.ToString;
import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@ToString(exclude = {"user"})
@Data
@Entity
@Table(name = "progress_updates")
public class ProgressUpdate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String topic;
    private String completed;
    private String newSkills;
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @Override
    public String toString() {
        return "ProgressUpdate{id=" + id + ", topic='" + topic + "', userId=" + (user != null ? user.getId() : null) + "}";
    }
}