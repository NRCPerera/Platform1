package com.skillshare.platform.controller;

import com.skillshare.platform.dto.LearningPlanDTO;
import com.skillshare.platform.model.LearningPlan;
import com.skillshare.platform.model.Task;
import com.skillshare.platform.service.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/learning-plans")
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;
    
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
    public ResponseEntity<?> getAllPlans(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<LearningPlanDTO> plans = learningPlanService.findAll();
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/my-plans")
    public ResponseEntity<?> getUserPlans(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = extractEmail(authentication);
        List<LearningPlanDTO> plans = learningPlanService.findByUserEmail(email);
        return ResponseEntity.ok(plans);
    }

    @PostMapping
    public ResponseEntity<LearningPlan> createPlan(
            @RequestBody LearningPlan plan,
            Authentication authentication) {
        String email = extractEmail(authentication);
        LearningPlan createdPlan = learningPlanService.createPlan(email, plan);
        return ResponseEntity.ok(createdPlan);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningPlan> updatePlan(
            @PathVariable Long id,
            @RequestBody LearningPlan plan,
            Authentication authentication) {
        String email = extractEmail(authentication);
        LearningPlan updatedPlan = learningPlanService.updatePlan(id, email, plan);
        return ResponseEntity.ok(updatedPlan);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(
            @PathVariable Long id,
            Authentication authentication) {
        String email = extractEmail(authentication);
        learningPlanService.deletePlan(id, email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/extend")
    public ResponseEntity<LearningPlan> extendPlan(
            @PathVariable Long id,
            @RequestBody String newEndDate,
            Authentication authentication) {
        String email = extractEmail(authentication);
        // Parse the date string (e.g., "2025-05-27T00:00:00" or "2025-05-27")
        LocalDateTime parsedDateTime;
        try {
            if (newEndDate.length() <= 10) { // Handle YYYY-MM-DD
                parsedDateTime = LocalDateTime.parse(newEndDate + "T00:00:00", DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } else { // Handle full ISO 8601
                parsedDateTime = LocalDateTime.parse(newEndDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date format. Use YYYY-MM-DD or YYYY-MM-DDThh:mm:ss");
        }
        LearningPlan extendedPlan = learningPlanService.extendPlan(id, email, parsedDateTime);
        return ResponseEntity.ok(extendedPlan);
    }

    @PostMapping("/tasks/{taskId}/complete")
    public ResponseEntity<Task> completeTask(
            @PathVariable Long taskId,
            Authentication authentication) {
        String email = extractEmail(authentication);
        Task completedTask = learningPlanService.completeTask(taskId, email);
        return ResponseEntity.ok(completedTask);
    }
}