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

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegistrationRequest registrationRequest) {
        User user = authService.registerUser(registrationRequest);
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