package com.skillshare.platform.controller;

import com.skillshare.platform.dto.LearningPlanDTO;
import com.skillshare.platform.model.LearningPlan;
import com.skillshare.platform.model.Task;
import com.skillshare.platform.service.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/learning-plans")
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;

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
            @AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        LearningPlan createdPlan = learningPlanService.createPlan(email, plan);
        return ResponseEntity.ok(createdPlan);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningPlan> updatePlan(
            @PathVariable Long id,
            @RequestBody LearningPlan plan,
            @AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        LearningPlan updatedPlan = learningPlanService.updatePlan(id, email, plan);
        return ResponseEntity.ok(updatedPlan);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        learningPlanService.deletePlan(id, email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/extend")
    public ResponseEntity<LearningPlan> extendPlan(
            @PathVariable Long id,
            @RequestBody LocalDateTime newEndDate,
            @AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        LearningPlan extendedPlan = learningPlanService.extendPlan(id, email, newEndDate);
        return ResponseEntity.ok(extendedPlan);
    }

    @PostMapping("/tasks/{taskId}/complete")
    public ResponseEntity<Task> completeTask(
            @PathVariable Long taskId,
            @AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        Task completedTask = learningPlanService.completeTask(taskId, email);
        return ResponseEntity.ok(completedTask);
    }
}