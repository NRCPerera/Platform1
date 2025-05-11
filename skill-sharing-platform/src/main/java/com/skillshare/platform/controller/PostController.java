package com.skillshare.platform.controller;

import com.skillshare.platform.dto.PostDTO;
import com.skillshare.platform.dto.SharedPostDTO;
import com.skillshare.platform.model.Post;
import com.skillshare.platform.model.SharedPost;
import com.skillshare.platform.service.PostService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    private String extractEmail(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof User userDetails) {
            System.out.println("User email: " + userDetails.getUsername());
            return userDetails.getUsername();
        } else if (principal instanceof OAuth2User oauth2User) {
            return oauth2User.getAttribute("email"); // OAuth2 login
        }
        throw new RuntimeException("Unsupported principal type");
    }

    @GetMapping
    public ResponseEntity<?> getAllPosts(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = extractEmail(authentication);
        List<PostDTO> posts = postService.findAllPosts(email);
        return ResponseEntity.ok(posts);
    }

    @PostMapping(value = "/posts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Post> createPost(
            Authentication authentication,
            @RequestParam String content,
            @RequestParam(required = false) MultipartFile[] mediaFiles) {

        String email = extractEmail(authentication);

        if (mediaFiles != null && mediaFiles.length > 0) {
            System.out.println("Received " + mediaFiles.length + " media files");
            for (MultipartFile file : mediaFiles) {
                System.out.println("File: " + file.getOriginalFilename() + 
                                  " (" + file.getContentType() + ", " + 
                                  file.getSize() + " bytes)");
            }
        }

        Post post = postService.createPost(email, content, mediaFiles);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(
            @PathVariable Long id,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = extractEmail(authentication);
        try {
            PostDTO post = postService.findPostById(id, email);
            return ResponseEntity.ok(post);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Object>> likePost(@PathVariable Long id, Authentication authentication) {
        String email = extractEmail(authentication);
        Map<String, Object> response = postService.likePost(id, email);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, Authentication authentication) {
        String email = extractEmail(authentication);
        postService.deletePost(id, email);
        return ResponseEntity.ok().build();
    }

    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Post> updatePost(
            @PathVariable Long id,
            Authentication authentication,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) MultipartFile[] mediaFiles) {

        String email = extractEmail(authentication);

        Post updatedPost = postService.updatePost(id, email, content, mediaFiles);
        return ResponseEntity.ok(updatedPost);
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<SharedPost> sharePost(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> shareData,
            Authentication authentication) {

        String email = extractEmail(authentication);
        String shareComment = (shareData != null) ? shareData.get("shareComment") : null;

        SharedPost sharedPost = postService.sharePost(id, email, shareComment);
        return ResponseEntity.ok(sharedPost);
    }

    @GetMapping("/shared/user/{userId}")
    public ResponseEntity<?> getSharedPostsByUser(
            @PathVariable Long userId,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<SharedPostDTO> sharedPosts = postService.getSharedPostsByUserId(userId);
        return ResponseEntity.ok(sharedPosts);
    }

    @GetMapping("/shared/me")
    public ResponseEntity<List<SharedPostDTO>> getMySharedPosts(Authentication authentication) {
        String email = extractEmail(authentication);
        List<SharedPostDTO> sharedPosts = postService.getMySharedPosts(email);
        return ResponseEntity.ok(sharedPosts);
    }

    @DeleteMapping("/shared/{id}")
    public ResponseEntity<Void> deleteSharedPost(
            @PathVariable Long id,
            Authentication authentication) {

        String email = extractEmail(authentication);
        postService.deleteSharedPost(id, email);
        return ResponseEntity.ok().build();
    }
}
