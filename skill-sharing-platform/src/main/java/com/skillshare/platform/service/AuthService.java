package com.skillshare.platform.service;

import com.skillshare.platform.dto.LoginRequest;
import com.skillshare.platform.dto.RegistrationRequest;
import com.skillshare.platform.model.User;
import com.skillshare.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public User registerUser(RegistrationRequest registrationRequest, MultipartFile profilePhoto) {
        // Check if user already exists
        if (userRepository.findByEmail(registrationRequest.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists with email: " + registrationRequest.getEmail());
        }

        // Create new user
        User user = new User();
        user.setEmail(registrationRequest.getEmail());
        user.setName(registrationRequest.getName());
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        user.setProvider("local");
        user.setBio("");
        user.setActive(true);

        // Handle profile photo upload
        if (profilePhoto != null && !profilePhoto.isEmpty()) {
            try {
                String fileName = UUID.randomUUID().toString() + "_" + profilePhoto.getOriginalFilename();
                Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, profilePhoto.getBytes());
                user.setProfilePhotoUrl("/media/" + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload profile photo", e);
            }
        }

        return userRepository.save(user);
    }

    public User authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        return userRepository.findByEmail(loginRequest.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}