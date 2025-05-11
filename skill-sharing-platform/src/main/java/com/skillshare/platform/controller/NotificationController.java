package com.skillshare.platform.controller;

import com.skillshare.platform.dto.NotificationDTO;
import com.skillshare.platform.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;
    
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
    public List<NotificationDTO> getNotifications(Authentication authentication) {
        String email = extractEmail(authentication);
        return notificationService.findByUserEmail(email);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id, Authentication authentication) {
        // Authentication might be needed in service layer for permission checking
        String email = extractEmail(authentication);
        notificationService.markAsRead(id);
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id, Authentication authentication) {
        // Authentication might be needed in service layer for permission checking
        String email = extractEmail(authentication);
        notificationService.deleteNotification(id);
    }
}