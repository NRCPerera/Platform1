package com.skillshare.platform.model;

import lombok.Data;
import lombok.ToString;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@ToString(exclude = {"posts", "learningPlans", "progressUpdates", "followers", "following", "sharedPosts"})
@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;
    
    private String name;
    private String bio;
    
    // Fields for traditional authentication
    private String password;
    
    // Provider information for OAuth users
    private String provider; // "local", "google", etc.
    
    // Flag to determine if account is active
    private boolean active = true;

    // Profile photo URL
    private String profilePhotoUrl;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Post> posts = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<LearningPlan> learningPlans = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ProgressUpdate> progressUpdates = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "user_followers",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "follower_id")
    )
    @JsonIgnore
    private List<User> followers = new ArrayList<>();

    @ManyToMany(mappedBy = "followers")
    @JsonIgnore
    private List<User> following = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<SharedPost> sharedPosts = new ArrayList<>();
}