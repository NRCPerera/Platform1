package com.skillshare.platform.controller;

import com.skillshare.platform.dto.PostDTO;
import com.skillshare.platform.dto.UserDTO;
import com.skillshare.platform.model.User;
import com.skillshare.platform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    private String extractEmail(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        } else if (principal instanceof OAuth2User oauth2User) {
            return oauth2User.getAttribute("email");
        }
        throw new RuntimeException("Unsupported principal type");
    }

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        String email = extractEmail(authentication);
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("bio", user.getBio());
        response.put("provider", user.getProvider());
        response.put("active", user.isActive());
        response.put("profilePhotoUrl", user.getProfilePhotoUrl());
        response.put("followersCount", user.getFollowers() != null ? user.getFollowers().size() : 0);
        response.put("followingCount", user.getFollowing() != null ? user.getFollowing().size() : 0);
    
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<User> registerOrGetUser(Authentication authentication) {
        String email = extractEmail(authentication);
        final String name = (authentication.getPrincipal() instanceof OAuth2User oauth2User) 
                ? oauth2User.getAttribute("name") 
                : null;
        
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
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable Long id) {
        UserDTO user = userService.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

         Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("bio", user.getBio());
        response.put("profilePhotoUrl", user.getProfilePhotoUrl());
        response.put("followersCount", user.getFollowers() != null ? user.getFollowers().size() : 0);
        response.put("followingCount", user.getFollowing() != null ? user.getFollowing().size() : 0);
    
        return ResponseEntity.ok(response);
        
    }

    @PostMapping("/{id}/follow/{followId}")
    public ResponseEntity<Void> followUser(
            @PathVariable Long id,
            @PathVariable Long followId,
            Authentication authentication) {
        String email = extractEmail(authentication);
        userService.followUser(id, followId, email);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/follow/{followId}")
    public ResponseEntity<Void> unfollowUser(
            @PathVariable Long id,
            @PathVariable Long followId,
            Authentication authentication) {
        String email = extractEmail(authentication);
        userService.unfollowUser(id, followId, email);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/following/{followId}")
    public ResponseEntity<Map<String, Boolean>> isFollowing(
            @PathVariable Long id,
            @PathVariable Long followId,
            Authentication authentication) {
        String email = extractEmail(authentication);
        boolean isFollowing = userService.isFollowing(id, followId, email);
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<List<PostDTO>> getUserPosts(@PathVariable Long id) {
        List<PostDTO> posts = userService.getUserPosts(id);
        return ResponseEntity.ok(posts);
    }

    @PatchMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhoto,
            Authentication authentication) {
        
        String authEmail = extractEmail(authentication);
        UserDTO updatedUser = userService.updateUser(id, name, email, bio, profilePhoto, authEmail);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/{id}/followers")
    public ResponseEntity<List<UserDTO>> getFollowers(
            @PathVariable Long id,
            Authentication authentication) {
        String currentUserEmail = null;
        if (authentication != null) {
            currentUserEmail = extractEmail(authentication);
        }
        List<UserDTO> followers = userService.getFollowers(id, currentUserEmail);
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/{id}/following")
    public ResponseEntity<List<UserDTO>> getFollowing(
            @PathVariable Long id,
            Authentication authentication) {
        String currentUserEmail = null;
        if (authentication != null) {
            currentUserEmail = extractEmail(authentication);
        }
        List<UserDTO> following = userService.getFollowing(id, currentUserEmail);
        return ResponseEntity.ok(following);
    }
}