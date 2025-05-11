package com.skillshare.platform.service;

import com.skillshare.platform.dto.CommentDTO;
import com.skillshare.platform.dto.PostDTO;
import com.skillshare.platform.dto.UserDTO;
import com.skillshare.platform.model.Media;
import com.skillshare.platform.model.User;
import com.skillshare.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Optional<UserDTO> findById(Long id) {
        return userRepository.findById(id).map(user -> {

            // Return fully built UserDTO
            return new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getFollowing(),
                user.getFollowers(), 
                user.getBio() // Make sure UserDTO includes bio field
            );
        });
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public void followUser(Long userId, Long followId, String email) {
        User user = userRepository.findById(userId).orElse(null);
        User followUser = userRepository.findById(followId).orElse(null);
        if (user != null && followUser != null) {
            user.getFollowing().add(followUser); 
            followUser.getFollowers().add(user);
            userRepository.save(user);
            userRepository.save(followUser);
        }
    }

    public void unfollowUser(Long userId, Long followId, String email) {
        User user = userRepository.findById(userId).orElse(null);
        User followUser = userRepository.findById(followId).orElse(null);
        if (user != null && followUser != null) {
            user.getFollowing().remove(followUser); 
            followUser.getFollowers().remove(user);
            userRepository.save(user);
            userRepository.save(followUser);
        }
    }

    public boolean isFollowing(Long userId, Long followId, String email) {
        // Step 1: Validate identity
        User user = userRepository.findByEmail(email)
        .   orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    
        if (!user.getId().equals(userId)) {
            throw new AccessDeniedException("You are not allowed to check this relationship.");
        }

    // Step 2: Check if followId exists in user's following list
        return user.getFollowing().stream()
            .anyMatch(followingUser -> followingUser.getId().equals(followId));
    }

    public List<PostDTO> getUserPosts(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return Collections.emptyList();
    
        return user.getPosts().stream()
            .map(post -> {
                // Map comments to DTO
                List<CommentDTO> commentDTOs = post.getComments().stream()
                    .map(comment -> new CommentDTO(
                        comment.getId(),
                        comment.getContent(),
                        comment.getCreatedAt(),
                        comment.getUser().getName()
                    ))
                    .collect(Collectors.toList());
    
                // Optionally map media URLs (if needed in PostDTO)
                List<String> mediaUrls = post.getMediaFiles() != null
                    ? post.getMediaFiles().stream()
                        .map(Media::getUrl)
                        .collect(Collectors.toList())
                    : Collections.emptyList();
    
                // Return fully built PostDTO
                return new PostDTO(
                    post.getId(),
                    post.getContent(),
                    post.getLikes(),
                    post.getCreatedAt(),
                    post.getLikedUsers().contains(post.getUser()),
                    post.getUser(),
                    commentDTOs,
                    mediaUrls // Add this only if PostDTO has a field for it
                );
            })
            .collect(Collectors.toList());
    }
    
    public UserDTO updateBio(Long userId, String bio, String email) {
        // Validate user identity
        User authenticatedUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        User userToUpdate = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));
        
        // Security check - only allow users to update their own bio
        if (!authenticatedUser.getId().equals(userId)) {
            throw new AccessDeniedException("You are not allowed to update this user's bio");
        }
        
        // Update bio
        userToUpdate.setBio(bio);
        userToUpdate = userRepository.save(userToUpdate);
        
        // Return updated UserDTO
        return new UserDTO(
            userToUpdate.getId(),
            userToUpdate.getName(),
            userToUpdate.getEmail(),
            userToUpdate.getFollowing(),
            userToUpdate.getFollowers(),
            userToUpdate.getBio()  // Make sure UserDTO includes bio field
        );
    }

}