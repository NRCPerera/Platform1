package com.skillshare.platform.controller;

import com.skillshare.platform.dto.CommentDTO;
import com.skillshare.platform.model.Comment;
import com.skillshare.platform.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

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
    public List<CommentDTO> getComments(@PathVariable Long postId) {
        return commentService.findByPostId(postId);
    }

    @PostMapping
    public ResponseEntity<Comment> createComment(
            @PathVariable Long postId,
            @RequestBody Comment comment,
            Authentication authentication) {
        String email = extractEmail(authentication);
        Comment createdComment = commentService.createComment(postId, email, comment.getContent());
        return ResponseEntity.ok(createdComment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(
            @PathVariable Long id,
            @RequestBody Comment comment,
            Authentication authentication) {
        String email = extractEmail(authentication);
        Comment updatedComment = commentService.updateComment(id, email, comment.getContent());
        return ResponseEntity.ok(updatedComment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            Authentication authentication) {
        String email = extractEmail(authentication);
        commentService.deleteComment(id, email);
        return ResponseEntity.ok().build();
    }
}