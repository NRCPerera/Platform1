package com.skillshare.platform.model;

import lombok.Data;
import lombok.ToString;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

@ToString(exclude = {"user", "mediaFiles", "comments"})
@Data
@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    private int likes;

    @JsonIgnore
    @ManyToMany
    private Set<User> likedUsers = new HashSet<>();

    private LocalDateTime createdAt;

    private boolean isLiked; // New field to indicate if the user liked the post

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @JsonIgnore
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Media> mediaFiles = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private List<Comment> comments = new ArrayList<>();

    public void addMedia(Media media) {
        this.mediaFiles.add(media);
        media.setPost(this);
    }
}