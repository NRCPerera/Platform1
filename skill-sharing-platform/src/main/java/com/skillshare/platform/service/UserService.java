package com.skillshare.platform.service;

import com.skillshare.platform.dto.CommentDTO;
import com.skillshare.platform.dto.PostDTO;
import com.skillshare.platform.dto.UserDTO;
import com.skillshare.platform.model.Media;
import com.skillshare.platform.model.User;
import com.skillshare.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Define the upload directory (configure in application.properties or hardcode for simplicity)
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public Optional<UserDTO> findById(Long id) {
        return userRepository.findById(id).map(user -> {
            return new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getFollowing(),
                user.getFollowers(),
                user.getBio(),
                user.getProfilePhotoUrl()
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
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    
        if (!user.getId().equals(userId)) {
            throw new AccessDeniedException("You are not allowed to check this relationship.");
        }

        return user.getFollowing().stream()
            .anyMatch(followingUser -> followingUser.getId().equals(followId));
    }

    public List<PostDTO> getUserPosts(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return Collections.emptyList();
    
        return user.getPosts().stream()
            .map(post -> {
                List<CommentDTO> commentDTOs = post.getComments().stream()
                    .map(comment -> new CommentDTO(
                        comment.getId(),
                        comment.getContent(),
                        comment.getCreatedAt(),
                        comment.getUser().getName()
                    ))
                    .collect(Collectors.toList());
    
                List<String> mediaUrls = post.getMediaFiles() != null
                    ? post.getMediaFiles().stream()
                        .map(Media::getUrl)
                        .collect(Collectors.toList())
                    : Collections.emptyList();
    
                return new PostDTO(
                    post.getId(),
                    post.getContent(),
                    post.getLikes(),
                    post.getCreatedAt(),
                    post.getLikedUsers().contains(post.getUser()),
                    post.getUser(),
                    commentDTOs,
                    mediaUrls
                );
            })
            .collect(Collectors.toList());
    }

    public UserDTO updateUser(Long userId, String name, String email, String bio, MultipartFile profilePhoto, String authEmail) {
        // Validate user identity
        User authenticatedUser = userRepository.findByEmail(authEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + authEmail));
        
        User userToUpdate = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));
        
        // Security check - only allow users to update their own profile
        if (!authenticatedUser.getId().equals(userId)) {
            throw new AccessDeniedException("You are not allowed to update this user's profile");
        }
        
        // Update fields if provided
        if (name != null && !name.trim().isEmpty()) {
            userToUpdate.setName(name);
        }
        if (email != null && !email.trim().isEmpty()) {
            userToUpdate.setEmail(email);
        }
        if (bio != null) {
            userToUpdate.setBio(bio);
        }
        
        // Handle profile photo upload
        if (profilePhoto != null && !profilePhoto.isEmpty()) {
            try {
                // Ensure upload directory exists
                File dir = new File(uploadDir);
                if (!dir.exists()) {
                    dir.mkdirs();
                }
                
                // Generate unique filename
                String fileName = UUID.randomUUID().toString() + "_" + profilePhoto.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                
                // Save file
                Files.write(filePath, profilePhoto.getBytes());
                
                // Set profile photo URL (relative path)
                userToUpdate.setProfilePhotoUrl("/media/" + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload profile photo", e);
            }
        }
        
        // Save updated user
        userToUpdate = userRepository.save(userToUpdate);
        
        // Return updated UserDTO
        return new UserDTO(
            userToUpdate.getId(),
            userToUpdate.getName(),
            userToUpdate.getEmail(),
            userToUpdate.getFollowing(),
            userToUpdate.getFollowers(),
            userToUpdate.getBio(),
            userToUpdate.getProfilePhotoUrl()
        );
    }
}