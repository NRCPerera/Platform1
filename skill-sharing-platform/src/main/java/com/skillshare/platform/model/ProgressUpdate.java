package com.skillshare.platform.model;

import lombok.Data;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "progress_updates")
public class ProgressUpdate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title cannot be empty")
    private String title;

    @NotBlank(message = "Topic cannot be empty")
    private String topic;

    private String description;

    public enum ProgressStatus {
        PLANNED, IN_PROGRESS, COMPLETED
    }

    @Enumerated(EnumType.STRING)
    private ProgressStatus status;

    public enum SkillLevel {
        BEGINNER, INTERMEDIATE, ADVANCED
    }

    @Enumerated(EnumType.STRING)
    private SkillLevel skillLevel;

    @ElementCollection
    @CollectionTable(name = "progress_update_attachments", joinColumns = @JoinColumn(name = "progress_update_id"))
    @Column(name = "attachment_url")
    private List<String> attachments = new ArrayList<>();

    public enum Visibility {
        PUBLIC, PRIVATE, FRIENDS
    }

    @Enumerated(EnumType.STRING)
    private Visibility visibility = Visibility.PUBLIC;

    @ElementCollection
    @CollectionTable(name = "progress_update_tags", joinColumns = @JoinColumn(name = "progress_update_id"))
    @Column(name = "tag")
    private Set<String> tags = new HashSet<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Transient
    private String userName;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @PostLoad
    private void populateUserName() {
        this.userName = user != null ? user.getName() : null;
    }

    @Override
    public String toString() {
        return "ProgressUpdate{id=" + id + ", title='" + title + "', topic='" + topic + "', userId=" + (user != null ? user.getId() : null) + "}";
    }
}