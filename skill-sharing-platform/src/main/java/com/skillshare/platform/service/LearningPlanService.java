package com.skillshare.platform.service;

import com.skillshare.platform.dto.LearningPlanDTO;
import com.skillshare.platform.dto.TaskDTO;
import com.skillshare.platform.model.LearningPlan;
import com.skillshare.platform.model.Task;
import com.skillshare.platform.model.User;
import com.skillshare.platform.repository.LearningPlanRepository;
import com.skillshare.platform.repository.TaskRepository;
import com.skillshare.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LearningPlanService {

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    public List<LearningPlanDTO> findAll() {
        return learningPlanRepository.findAll().stream().map(plan -> {
            List<TaskDTO> taskDTOs = plan.getTasks().stream().map(task -> 
                new TaskDTO(
                    task.getId(),
                    task.getDescription(),
                    task.isCompleted(),
                    task.getDueDate(),
                    task.getCompletedAt()
                )
            ).collect(Collectors.toList());

            return new LearningPlanDTO(
                plan.getId(),
                plan.getTopic(),
                plan.getResources(),
                plan.getTimeline(),
                plan.getCreatedAt(),
                plan.getStartDate(),
                plan.getEndDate(),
                plan.isExtended(),
                plan.getUser().getName(),
                taskDTOs
            );
        }).collect(Collectors.toList());
    }

    public LearningPlan createPlan(String email, LearningPlan plan) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        plan.setUser(user);
        plan.setCreatedAt(LocalDateTime.now());
        plan.getTasks().forEach(task -> task.setLearningPlan(plan));
        return learningPlanRepository.save(plan);
    }

    public LearningPlan updatePlan(Long planId, String email, LearningPlan plan) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        LearningPlan existingPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        if (!existingPlan.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        existingPlan.setTopic(plan.getTopic());
        existingPlan.setResources(plan.getResources());
        existingPlan.setTimeline(plan.getTimeline());
        existingPlan.setStartDate(plan.getStartDate());
        existingPlan.setEndDate(plan.getEndDate());
        existingPlan.setExtended(plan.isExtended());
        
        // Update tasks
        existingPlan.getTasks().clear();
        plan.getTasks().forEach(task -> {
            task.setLearningPlan(existingPlan);
            existingPlan.getTasks().add(task);
        });
        
        return learningPlanRepository.save(existingPlan);
    }

    public void deletePlan(Long planId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        LearningPlan plan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        if (!plan.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        learningPlanRepository.delete(plan);
    }

    public Task completeTask(Long taskId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        if (!task.getLearningPlan().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        task.setCompleted(true);
        task.setCompletedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public LearningPlan extendPlan(Long planId, String email, LocalDateTime newEndDate) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        LearningPlan plan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        if (!plan.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        plan.setEndDate(newEndDate);
        plan.setExtended(true);
        return learningPlanRepository.save(plan);
    }
}