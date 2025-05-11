package com.skillshare.platform.dto;

import lombok.Data;

@Data
public class RegistrationRequest {
    private String email;
    private String name;
    private String password;
}