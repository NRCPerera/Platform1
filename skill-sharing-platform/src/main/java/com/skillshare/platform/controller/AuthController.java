package com.skillshare.platform.controller;

import com.skillshare.platform.dto.AuthResponse;
import com.skillshare.platform.dto.LoginRequest;
import com.skillshare.platform.dto.RegistrationRequest;
import com.skillshare.platform.model.User;
import com.skillshare.platform.service.AuthService;
import com.skillshare.platform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private AuthService authService;

    @GetMapping("/session")
    public User getSession(@AuthenticationPrincipal Object principal) {
        // Handle both OAuth2User and UserDetails
        if (principal instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) principal;
            String email = oauth2User.getAttribute("email");
            return userService.findByEmail(email).orElse(null);
        } else if (principal instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) principal;
            String email = userDetails.getUsername();
            return userService.findByEmail(email).orElse(null);
        }
        return null;
    }

    @PostMapping(value = "/register", consumes = {"multipart/form-data"})
    public ResponseEntity<AuthResponse> register(
            @RequestPart("name") String name,
            @RequestPart("email") String email,
            @RequestPart("password") String password,
            @RequestPart(value = "profilePhoto", required = false) MultipartFile profilePhoto) {
        // Construct RegistrationRequest from form fields
        RegistrationRequest registrationRequest = new RegistrationRequest();
        registrationRequest.setName(name);
        registrationRequest.setEmail(email);
        registrationRequest.setPassword(password);

        User user = authService.registerUser(registrationRequest, profilePhoto);
        return ResponseEntity.ok(new AuthResponse(user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        User user = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(new AuthResponse(user));
    }

    @PostMapping("/logout")
    public void logout(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.getSession().invalidate();
        response.sendRedirect("/login");
    }
}