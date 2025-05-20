package com.skillshare.platform.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.skillshare.platform.dto.NotificationDTO;
import com.skillshare.platform.model.Notification;
import com.skillshare.platform.model.User;
import com.skillshare.platform.repository.NotificationRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    public List<NotificationDTO> findByUserEmail(String email) {
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(email).stream()
            .map(notification -> new NotificationDTO(
                    notification.getId(),
                    notification.getMessage(),
                    notification.getUser().getEmail(),
                    notification.getCreatedAt(),
                    notification.isRead()
            )).collect(Collectors.toList());
    }

    public void createNotification(User user, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(String email) {
        List<Notification> notifications = notificationRepository.findByUserEmailAndIsReadFalse(email); // Updated method name
        for (Notification notification : notifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}