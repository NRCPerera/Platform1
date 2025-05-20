package com.skillshare.platform.service;

import com.skillshare.platform.dto.CommentDTO;
import com.skillshare.platform.model.Comment;
import com.skillshare.platform.model.Post;
import com.skillshare.platform.model.User;
import com.skillshare.platform.repository.CommentRepository;
import com.skillshare.platform.repository.PostRepository;
import com.skillshare.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public List<CommentDTO> findByPostId(Long postId) {
    return commentRepository.findByPostId(postId).stream()
        .map(comment -> new CommentDTO(
            comment.getId(),
            comment.getContent(),
            comment.getCreatedAt(),
            comment.getUser()
        ))
        .collect(Collectors.toList());
    }


    public Comment createComment(Long postId, String email, String content) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        Comment comment = new Comment();
        comment.setContent(content);
        comment.setUser(user);
        comment.setPost(post);
        comment.setCreatedAt(LocalDateTime.now());
        Comment savedComment = commentRepository.save(comment);
        notificationService.createNotification(post.getUser(), user.getName() + " commented on your post!");
        return savedComment;
    }

    public Comment updateComment(Long commentId, String email, String content) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        comment.setContent(content);
        return commentRepository.save(comment);
    }

    public void deleteComment(Long commentId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUser().getId().equals(user.getId()) && !comment.getPost().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        commentRepository.delete(comment);
    }
}