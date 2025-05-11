package com.skillshare.platform.dto;

import java.time.LocalDateTime;

//import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SharedPostDTO {
    private Long id;
    private LocalDateTime sharedAt;
    private String shareComment;
    private String sharerName;
    
    
    private PostDTO originalPost; 
}