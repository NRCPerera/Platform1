package com.skillshare.platform.controller;

import com.skillshare.platform.dto.PostDTO;
import com.skillshare.platform.dto.UserDTO;
import com.skillshare.platform.model.Post;
import com.skillshare.platform.model.User;
import com.skillshare.platform.service.UserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        System.out.println("Current user email: " + email);
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    
        // Create a response map instead of returning the entity directly
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        // Add other needed fields but avoid circular references
    
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<User> registerOrGetUser(@AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        
        User user = userService.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name);
                    return userService.save(newUser);
                });
        
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        UserDTO user = userService.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{id}/follow/{followId}")
    public ResponseEntity<Void> followUser(
            @PathVariable Long id,
            @PathVariable Long followId,
            @AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        userService.followUser(id, followId, email);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/follow/{followId}")
    public ResponseEntity<Void> unfollowUser(
            @PathVariable Long id,
            @PathVariable Long followId,
            @AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        userService.unfollowUser(id, followId, email);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/following/{followId}")
    public ResponseEntity<Map<String, Boolean>> isFollowing(
            @PathVariable Long id,
            @PathVariable Long followId,
            @AuthenticationPrincipal OAuth2User principal) {
    
        String email = principal.getAttribute("email");
        boolean isFollowing = userService.isFollowing(id, followId, email);
    
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<List<PostDTO>> getUserPosts(@PathVariable Long id) {
        List<PostDTO> posts = userService.getUserPosts(id);
        return ResponseEntity.ok(posts);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserDTO> updateUserBio(
            @PathVariable Long id,
            @RequestBody Map<String, String> updateRequest,
            @AuthenticationPrincipal OAuth2User principal) {
        
        String email = principal.getAttribute("email");
        String bio = updateRequest.get("bio");
        
        if (bio == null) {
            return ResponseEntity.badRequest().build();
        }
        
        UserDTO updatedUser = userService.updateBio(id, bio, email);
        return ResponseEntity.ok(updatedUser);
    }
}