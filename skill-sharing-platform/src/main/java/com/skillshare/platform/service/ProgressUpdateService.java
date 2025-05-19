package com.skillshare.platform.service;

import com.skillshare.platform.dto.ProgressDTO;
import com.skillshare.platform.model.ProgressUpdate;
import com.skillshare.platform.model.User;
import com.skillshare.platform.repository.ProgressUpdateRepository;
import com.skillshare.platform.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public List<ProgressDTO> findAll(String email) {
        logger.info("Fetching progress updates for email: {}", email);
        List<ProgressUpdate> updates;
        if (email != null) {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            updates = progressUpdateRepository.findByUserIdOrVisibility(user.getId(), ProgressUpdate.Visibility.PUBLIC);
        } else {
            updates = progressUpdateRepository.findByVisibility(ProgressUpdate.Visibility.PUBLIC);
        }

        List<ProgressDTO> result = updates.stream().map(update -> new ProgressDTO(
                update.getId(),
                update.getTitle(),
                update.getTopic(),
                update.getDescription(),
                update.getStatus() != null ? update.getStatus().name() : null,
                update.getSkillLevel() != null ? update.getSkillLevel().name() : null,
                update.getAttachments(),
                update.getVisibility() != null ? update.getVisibility().name() : null,
                update.getTags(),
                update.getCreatedAt(),
                update.getUpdatedAt(),
                update.getUserName()
        )).collect(Collectors.toList());

        logger.info("Returning {} progress updates", result.size());
        return result;
    }

    public ProgressDTO createUpdate(String email, ProgressDTO progressDTO) {
        logger.info("Creating progress update for email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProgressUpdate update = new ProgressUpdate();
        update.setUser(user);
        update.setTitle(progressDTO.getTitle());
        update.setTopic(progressDTO.getTopic());
        update.setDescription(progressDTO.getDescription());
        update.setStatus(progressDTO.getStatus() != null ? ProgressUpdate.ProgressStatus.valueOf(progressDTO.getStatus()) : null);
        update.setSkillLevel(progressDTO.getSkillLevel() != null ? ProgressUpdate.SkillLevel.valueOf(progressDTO.getSkillLevel()) : null);
        update.setAttachments(progressDTO.getAttachments());
        update.setVisibility(progressDTO.getVisibility() != null ? ProgressUpdate.Visibility.valueOf(progressDTO.getVisibility()) : ProgressUpdate.Visibility.PUBLIC);
        update.setTags(progressDTO.getTags());
        update.setCreatedAt(LocalDateTime.now());
        update.setUpdatedAt(LocalDateTime.now());

        ProgressUpdate savedUpdate = progressUpdateRepository.save(update);
        logger.info("Saved update with ID: {}", savedUpdate.getId());

        return new ProgressDTO(
                savedUpdate.getId(),
                savedUpdate.getTitle(),
                savedUpdate.getTopic(),
                savedUpdate.getDescription(),
                savedUpdate.getStatus() != null ? savedUpdate.getStatus().name() : null,
                savedUpdate.getSkillLevel() != null ? savedUpdate.getSkillLevel().name() : null,
                savedUpdate.getAttachments(),
                savedUpdate.getVisibility() != null ? savedUpdate.getVisibility().name() : null,
                savedUpdate.getTags(),
                savedUpdate.getCreatedAt(),
                savedUpdate.getUpdatedAt(),
                savedUpdate.getUserName()
        );
    }

    public ProgressDTO updateUpdate(Long updateId, String email, ProgressDTO progressDTO) {
        logger.info("Updating progress update ID: {} for email: {}", updateId, email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ProgressUpdate update = progressUpdateRepository.findById(updateId)
                .orElseThrow(() -> new RuntimeException("Update not found"));

        if (!update.getUser().getId().equals(user.getId())) {
            logger.error("Unauthorized: User {} cannot update update {}", email, updateId);
            throw new RuntimeException("Unauthorized");
        }

        update.setTitle(progressDTO.getTitle());
        update.setTopic(progressDTO.getTopic());
        update.setDescription(progressDTO.getDescription());
        update.setStatus(progressDTO.getStatus() != null ? ProgressUpdate.ProgressStatus.valueOf(progressDTO.getStatus()) : null);
        update.setSkillLevel(progressDTO.getSkillLevel() != null ? ProgressUpdate.SkillLevel.valueOf(progressDTO.getSkillLevel()) : null);
        update.setAttachments(progressDTO.getAttachments());
        update.setVisibility(progressDTO.getVisibility() != null ? ProgressUpdate.Visibility.valueOf(progressDTO.getVisibility()) : ProgressUpdate.Visibility.PUBLIC);
        update.setTags(progressDTO.getTags());
        update.setUpdatedAt(LocalDateTime.now());

        ProgressUpdate savedUpdate = progressUpdateRepository.save(update);
        logger.info("Updated update with ID: {}", savedUpdate.getId());

        return new ProgressDTO(
                savedUpdate.getId(),
                savedUpdate.getTitle(),
                savedUpdate.getTopic(),
                savedUpdate.getDescription(),
                savedUpdate.getStatus() != null ? savedUpdate.getStatus().name() : null,
                savedUpdate.getSkillLevel() != null ? savedUpdate.getSkillLevel().name() : null,
                savedUpdate.getAttachments(),
                savedUpdate.getVisibility() != null ? savedUpdate.getVisibility().name() : null,
                savedUpdate.getTags(),
                savedUpdate.getCreatedAt(),
                savedUpdate.getUpdatedAt(),
                savedUpdate.getUserName()
        );
    }

    @Transactional
    public void deleteUpdate(Long updateId, String email) {
        logger.info("Attempting to delete update {} for user with email {}", updateId, email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ProgressUpdate update = progressUpdateRepository.findById(updateId)
                .orElseThrow(() -> new RuntimeException("Update not found"));

        if (update.getUser() == null || !update.getUser().getId().equals(user.getId())) {
            logger.error("Unauthorized: User {} cannot delete update {}", email, updateId);
            throw new RuntimeException("Unauthorized");
        }

        progressUpdateRepository.delete(update);
        logger.info("Update {} successfully deleted", updateId);
    }
}