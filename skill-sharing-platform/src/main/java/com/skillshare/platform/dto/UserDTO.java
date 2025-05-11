package com.skillshare.platform.dto;


import lombok.NoArgsConstructor;

import java.util.List;

import com.skillshare.platform.model.User;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private List<User> following;
    private List<User> followers;
    private String bio;

    public UserDTO(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
}
