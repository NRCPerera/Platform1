package com.skillshare.platform.model;

import lombok.Data;
import lombok.ToString;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@ToString(exclude = {"post"})
@Data
@Entity
@Table(name = "media")
public class Media {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;
    private String type; // "image" or "video"

    @ManyToOne
    @JoinColumn(name = "post_id")
    @JsonIgnore
    private Post post;
}