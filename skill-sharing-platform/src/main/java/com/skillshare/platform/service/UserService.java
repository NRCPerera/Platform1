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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public Optional<UserDTO> findById(Long id) {
        return userRepository.findById(id).map(user -> {
            UserDTO dto = new UserDTO();
            dto.setId(user.getId());
            dto.setName(user.getName());
            dto.setEmail(user.getEmail());
            dto.setBio(user.getBio());
            dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
            dto.setFollowers(user.getFollowers() != null ? new ArrayList<>(user.getFollowers()) : Collections.emptyList());
            dto.setFollowing(user.getFollowing() != null ? new ArrayList<>(user.getFollowing()) : Collections.emptyList());
            return dto;
        });
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public void followUser(Long userId, Long followId, String email) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        User followUser = userRepository.findById(followId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + followId));

        // Prevent self-follow
        if (userId.equals(followId)) {
            throw new IllegalArgumentException("Users cannot follow themselves");
        }

        // Check if the user is already following the target user
        if (!user.getFollowing().contains(followUser)) {
            user.getFollowing().add(followUser);
            followUser.getFollowers().add(user);
            userRepository.save(user);
            userRepository.save(followUser);
        }
        // If already following, do nothing (idempotent operation)
    }

    public void unfollowUser(Long userId, Long followId, String email) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        User followUser = userRepository.findById(followId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + followId));

        user.getFollowing().remove(followUser);
        followUser.getFollowers().remove(user);
        userRepository.save(user);
        userRepository.save(followUser);
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
                        comment.getUser()
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
        User authenticatedUser = userRepository.findByEmail(authEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + authEmail));
        
        User userToUpdate = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));
        
        if (!authenticatedUser.getId().equals(userId)) {
            throw new AccessDeniedException("You are not allowed to update this user's profile");
        }
        
        if (name != null && !name.trim().isEmpty()) {
            userToUpdate.setName(name);
        }
        if (email != null && !email.trim().isEmpty()) {
            userToUpdate.setEmail(email);
        }
        if (bio != null) {
            userToUpdate.setBio(bio);
        }
        
        if (profilePhoto != null && !profilePhoto.isEmpty()) {
            try {
                File dir = new File(uploadDir);
                if (!dir.exists()) {
                    dir.mkdirs();
                }
                
                String fileName = UUID.randomUUID().toString() + "_" + profilePhoto.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                
                Files.write(filePath, profilePhoto.getBytes());
                
                userToUpdate.setProfilePhotoUrl("/media/" + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload profile photo", e);
            }
        }
        
        userToUpdate = userRepository.save(userToUpdate);
        
        UserDTO dto = new UserDTO();
        dto.setId(userToUpdate.getId());
        dto.setName(userToUpdate.getName());
        dto.setEmail(userToUpdate.getEmail());
        dto.setBio(userToUpdate.getBio());
        dto.setProfilePhotoUrl(userToUpdate.getProfilePhotoUrl());
        // Optionally set followers/following if needed
        return dto;
    }

    public List<UserDTO> getFollowers(Long userId, String currentUserEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        User currentUser = null;
        if (currentUserEmail != null) {
            currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElse(null);
        }
        
        final User finalCurrentUser = currentUser;
        
        return user.getFollowers().stream()
                .map(follower -> {
                    UserDTO dto = convertToDTO(follower);
                    if (finalCurrentUser != null) {
                        dto.setIsFollowing(finalCurrentUser.getFollowing().contains(follower));
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<UserDTO> getFollowing(Long userId, String currentUserEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        User currentUser = null;
        if (currentUserEmail != null) {
            currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElse(null);
        }
        
        final User finalCurrentUser = currentUser;
        
        return user.getFollowing().stream()
                .map(following -> {
                    UserDTO dto = convertToDTO(following);
                    if (finalCurrentUser != null) {
                        dto.setIsFollowing(finalCurrentUser.getFollowing().contains(following));
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setBio(user.getBio());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        return dto;
    }
}