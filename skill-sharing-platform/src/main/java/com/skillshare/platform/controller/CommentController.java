package com.skillshare.platform.controller;

import com.skillshare.platform.dto.CommentDTO;
import com.skillshare.platform.model.Comment;
import com.skillshare.platform.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping
    public List<CommentDTO> getComments(@PathVariable Long postId) {
        return commentService.findByPostId(postId);
    }

    @PostMapping
    public ResponseEntity<Comment> createComment(
            @PathVariable Long postId,
            @RequestBody Comment comment,
            @AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        Comment createdComment = commentService.createComment(postId, email, comment.getContent());
        return ResponseEntity.ok(createdComment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(
            @PathVariable Long id,
            @RequestBody Comment comment,
            @AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        Comment updatedComment = commentService.updateComment(id, email, comment.getContent());
        return ResponseEntity.ok(updatedComment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        commentService.deleteComment(id, email);
        return ResponseEntity.ok().build();
    }
}
