package com.skillshare.platform.controller;

import com.skillshare.platform.dto.ProgressDTO;
import com.skillshare.platform.service.ProgressUpdateService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress-updates")
public class ProgressUpdateController {

    private static final Logger logger = LoggerFactory.getLogger(ProgressUpdateController.class);

    @Autowired
    private ProgressUpdateService progressUpdateService;

    private String extractEmail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof User userDetails) {
            return userDetails.getUsername(); // Form login
        } else if (principal instanceof OAuth2User oauth2User) {
            String email = oauth2User.getAttribute("email");
            if (email == null) {
                throw new RuntimeException("Email not found in OAuth2 user attributes");
            }
            return email; // OAuth2 login
        }
        throw new RuntimeException("Unsupported principal type: " + principal.getClass().getName());
    }

    @GetMapping
    public ResponseEntity<?> getAllUpdates(Authentication authentication) {
        try {
            String email = authentication != null && authentication.isAuthenticated() ? extractEmail(authentication) : null;
            List<ProgressDTO> updates = progressUpdateService.findAll(email);
            return ResponseEntity.ok(updates);
        } catch (Exception e) {
            logger.error("Error fetching updates: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching updates");
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> createUpdate(
            @Valid @RequestBody ProgressDTO progressDTO,
            Authentication authentication) {
        try {
            String email = extractEmail(authentication);
            logger.info("Creating update for user: {}", email);
            ProgressDTO createdUpdate = progressUpdateService.createUpdate(email, progressDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUpdate);
        } catch (Exception e) {
            logger.error("Error creating update: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating update: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUpdate(
            @PathVariable Long id,
            @Valid @RequestBody ProgressDTO progressDTO,
            Authentication authentication) {
        try {
            String email = extractEmail(authentication);
            logger.info("Updating update ID: {} for user: {}", id, email);
            ProgressDTO updatedUpdate = progressUpdateService.updateUpdate(id, email, progressDTO);
            return ResponseEntity.ok(updatedUpdate);
        } catch (RuntimeException e) {
            logger.error("Error updating update: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error updating update: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUpdate(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String email = extractEmail(authentication);
            logger.info("Deleting update ID: {} for user: {}", id, email);
            progressUpdateService.deleteUpdate(id, email);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("Error deleting update: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error deleting update: " + e.getMessage());
        }
    }
}