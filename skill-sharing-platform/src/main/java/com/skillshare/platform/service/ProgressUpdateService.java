package com.skillshare.platform.service;

import java.util.Optional;
import org.slf4j.Logger;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.skillshare.platform.model.ProgressUpdate;
import com.skillshare.platform.model.User;
import com.skillshare.platform.repository.ProgressUpdateRepository;
import com.skillshare.platform.repository.UserRepository;

import jakarta.transaction.Transactional;

import com.skillshare.platform.dto.ProgressDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgressUpdateService {
    private static final Logger logger = LoggerFactory.getLogger(ProgressUpdateService.class);
    
    @Autowired
    private ProgressUpdateRepository progressUpdateRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ProgressDTO> findAll() {
        List<ProgressDTO> result = progressUpdateRepository.findAll().stream().map(update -> {
            ProgressDTO dto = new ProgressDTO(
                    update.getId(),
                    update.getTopic(),
                    update.getCompleted(),
                    update.getNewSkills(),
                    update.getCreatedAt(),
                    update.getUser().getName()
            );
            System.out.println("Created ProgressDTO: " + dto);
            return dto;
        }).collect(Collectors.toList());
        
        System.out.println("Returning " + result.size() + " progress updates");
        System.out.println("Complete result: " + result);
        
        return result;
    }

    public ProgressUpdate createUpdate(String email, ProgressUpdate update) {
        System.out.println("Creating progress update for email: " + email);
        System.out.println("Input update details: " + update);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        System.out.println("Found user: " + user.getId() + ", name: " + user.getName());
        
        update.setUser(user);
        update.setCreatedAt(LocalDateTime.now());
        
        System.out.println("Update after setting user and timestamp: " + update);
        
        ProgressUpdate savedUpdate = progressUpdateRepository.save(update);
        
        System.out.println("Saved update with ID: " + savedUpdate.getId());
        System.out.println("Complete saved update: " + savedUpdate);
        
        return savedUpdate;
    }

    public ProgressDTO updateUpdate(Long updateId, String email, ProgressUpdate updateDetails) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ProgressUpdate update = progressUpdateRepository.findById(updateId)
                .orElseThrow(() -> new RuntimeException("Update not found"));
    
        
        System.out.println("Authenticated user ID: " + user.getId() + ", name: " + user.getName());
        System.out.println("Update ID: " + update.getId() + ", user ID: " + (update.getUser() != null ? update.getUser().getId() : null));
    
        if (!update.getUser().getId().equals(user.getId())) {
            System.out.println("Authorization failed: User ID mismatch");
            throw new RuntimeException("Unauthorized");
        }
    
        update.setTopic(updateDetails.getTopic());
        update.setCompleted(updateDetails.getCompleted());
        update.setNewSkills(updateDetails.getNewSkills());
    
        ProgressUpdate savedUpdate = progressUpdateRepository.save(update);
    
        return new ProgressDTO(
            savedUpdate.getId(),
            savedUpdate.getTopic(),
            savedUpdate.getCompleted(),
            savedUpdate.getNewSkills(),
            savedUpdate.getCreatedAt(),
            user.getName()
        );
    }

    @Transactional
    public void deleteUpdate(Long updateId, String email) {
        
        logger.info("Attempting to delete update {} for user with email {}", updateId, email);
        
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            logger.error("User with email {} not found", email);
            throw new RuntimeException("User not found");
        }
        User user = userOptional.get();
        logger.info("Found user: {} with ID: {}", user.getEmail(), user.getId());
        
        
        Optional<ProgressUpdate> updateOptional = progressUpdateRepository.findById(updateId);
        if (updateOptional.isEmpty()) {
            logger.error("Update with ID {} not found", updateId);
            throw new RuntimeException("Update not found");
        }
        ProgressUpdate update = updateOptional.get();
        
        
        if (update.getUser() == null) {
            logger.error("Update {} has no associated user", updateId);
            throw new RuntimeException("Update has no owner");
        }
        logger.info("Update belongs to user with ID: {}", update.getUser().getId());
        
        
        if (!update.getUser().getId().equals(user.getId())) {
            logger.error("User {} with ID {} is not authorized to delete update {} belonging to user with ID {}", 
                email, user.getId(), updateId, update.getUser().getId());
            throw new RuntimeException("Unauthorized");
        }
        
        
        logger.info("Deleting update {}", updateId);
        progressUpdateRepository.delete(update);
        logger.info("Update {} successfully deleted", updateId);
    }
}