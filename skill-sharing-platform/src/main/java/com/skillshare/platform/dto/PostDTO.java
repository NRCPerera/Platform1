package com.skillshare.platform.dto;

import java.time.LocalDateTime;
import java.util.List;
import com.skillshare.platform.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.minidev.json.annotate.JsonIgnore;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostDTO {
    private Long id;
    private String content;
    private int likes;
    private LocalDateTime createdAt;
    private boolean isLiked; 

    @JsonIgnore
    private User user;
    
    private List<CommentDTO> comments;
    private List<String> mediaUrls;
}