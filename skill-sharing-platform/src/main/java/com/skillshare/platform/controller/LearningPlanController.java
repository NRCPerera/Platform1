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
            @RequestBody LocalDateTime newEndDate,
            Authentication authentication) {
        String email = extractEmail(authentication);
        LearningPlan extendedPlan = learningPlanService.extendPlan(id, email, newEndDate);
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