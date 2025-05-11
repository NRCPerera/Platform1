package com.skillshare.platform.model;

import lombok.Data;
import lombok.ToString;
import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@ToString(exclude = {"user", "originalPost"})
@Data
@Entity
@Table(name = "shared_posts")
public class SharedPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime sharedAt;
    private String shareComment; // Optional comment when sharing

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user; // The user who shared the post

    @ManyToOne
    @JoinColumn(name = "post_id")
    @JsonIgnore
    private Post originalPost; // The original post being shared
}