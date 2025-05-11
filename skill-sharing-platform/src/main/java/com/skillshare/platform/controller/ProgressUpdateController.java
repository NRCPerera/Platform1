package com.skillshare.platform.controller;

import com.skillshare.platform.dto.ProgressDTO;
import com.skillshare.platform.model.ProgressUpdate;
import com.skillshare.platform.service.ProgressUpdateService;
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

    @Autowired
    private ProgressUpdateService progressUpdateService;
    
    private String extractEmail(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof User userDetails) {
            return userDetails.getUsername(); // form login
        } else if (principal instanceof OAuth2User oauth2User) {
            return oauth2User.getAttribute("email"); // OAuth2 login
        }
        throw new RuntimeException("Unsupported principal type");
    }

    @GetMapping
    public ResponseEntity<?> getAllUpdates(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<ProgressDTO> updates = progressUpdateService.findAll();
        return ResponseEntity.ok(updates);
    }

    @PostMapping("/add")
    public ResponseEntity<ProgressUpdate> createUpdate(
            @RequestBody ProgressUpdate update,
            Authentication authentication) {
        String email = extractEmail(authentication);
        ProgressUpdate createdUpdate = progressUpdateService.createUpdate(email, update);
        return ResponseEntity.ok(createdUpdate);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgressDTO> updateUpdate(
            @PathVariable Long id,
            @RequestBody ProgressUpdate update,
            Authentication authentication) {
        String email = extractEmail(authentication);
        ProgressDTO updatedUpdate = progressUpdateService.updateUpdate(id, email, update);
        return ResponseEntity.ok(updatedUpdate);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUpdate(
        @PathVariable Long id,
        Authentication authentication) {
        String email = extractEmail(authentication);
    
        if (authentication.getPrincipal() instanceof OAuth2User oauth2User) {
            oauth2User.getAttributes().forEach((key, value) -> 
                System.out.println("OAuth2 attribute: " + key + " = " + value));
        }
        System.out.println("Deleting progress update with ID: " + id + " for user: " + email);
        progressUpdateService.deleteUpdate(id, email);
        return ResponseEntity.ok().build();
    }
}