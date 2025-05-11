package com.skillshare.platform.service;

import com.skillshare.platform.dto.CommentDTO;
import com.skillshare.platform.dto.PostDTO;
import com.skillshare.platform.dto.SharedPostDTO;
import com.skillshare.platform.model.Comment;
import com.skillshare.platform.model.Media;
import com.skillshare.platform.model.Post;
import com.skillshare.platform.model.SharedPost;
import com.skillshare.platform.model.User;
import com.skillshare.platform.repository.PostRepository;
import com.skillshare.platform.repository.SharedPostRepository;
import com.skillshare.platform.repository.UserRepository;
import com.skillshare.platform.repository.MediaRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SharedPostRepository sharedPostRepository;

    @Autowired
    private MediaRepository mediaRepository;
    private S3Service s3Service;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private FileStorageService fileStorageService;

    public List<PostDTO> findAllPosts(String userEmail) {
        User currentUser = userEmail != null ? userRepository.findByEmail(userEmail).orElse(null) : null;
        return postRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream().map(post -> {
            List<CommentDTO> commentDTOs = post.getComments().stream().map(comment -> {
                return new CommentDTO(
                    comment.getId(),
                    comment.getContent(),
                    comment.getCreatedAt(),
                    comment.getUser().getName()
                );
            }).collect(Collectors.toList());
            
            List<String> mediaUrls = post.getMediaFiles().stream()
                .map(Media::getUrl)
                .collect(Collectors.toList());
            
            return new PostDTO(
                post.getId(),
                post.getContent(),
                post.getLikes(),
                post.getCreatedAt(),
                currentUser != null && post.getLikedUsers().contains(currentUser), // Ensure this evaluates correctly
                post.getUser(),
                commentDTOs,
                mediaUrls  
            );
        }).collect(Collectors.toList());
    }

    public PostDTO findPostById(Long id, String userEmail) {
        User currentUser = userEmail != null ? userRepository.findByEmail(userEmail).orElse(null) : null;
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + id));

        List<CommentDTO> commentDTOs = post.getComments().stream().map(comment -> {
            return new CommentDTO(
                comment.getId(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUser().getName()
            );
        }).collect(Collectors.toList());

        List<String> mediaUrls = post.getMediaFiles().stream()
            .map(Media::getUrl)
            .collect(Collectors.toList());

        return new PostDTO(
            post.getId(),
            post.getContent(),
            post.getLikes(),
            post.getCreatedAt(),
            currentUser != null && post.getLikedUsers().contains(currentUser),
            post.getUser(),
            commentDTOs,
            mediaUrls
        );
    }

    public List<Comment> getCommentsByPostId(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return post.getComments();
    }

    @Transactional
    public Post createPost(String email, String content, MultipartFile[] mediaFiles) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        Post post = new Post();
        post.setContent(content);
        post.setUser(user);
        post.setCreatedAt(LocalDateTime.now());
        post.setLikes(0);
        
        // Initialize media collection if null
        if (post.getMediaFiles() == null) {
            post.setMediaFiles(new ArrayList<>());
        }
        
        // Save post first to get ID
        Post savedPost = postRepository.save(post);
        
        // Process media files if any
        if (mediaFiles != null && mediaFiles.length > 0) {
            for (MultipartFile file : mediaFiles) {
                try {
                    // Skip empty files
                    if (file.isEmpty()) {
                        continue;
                    }
                    
                    // Upload the file and get URL
                    String url = fileStorageService.uploadFile(file);
                    
                    // Create media entity
                    Media media = new Media();
                    media.setUrl(url);
                    media.setType(file.getContentType().startsWith("image") ? "image" : "video");
                    media.setPost(savedPost);
                    
                    // Save media entity directly
                    mediaRepository.save(media);
                    
                    // Add to post's collection for return value
                    savedPost.getMediaFiles().add(media);
                    
                    System.out.println("Media saved with URL: " + url);
                } catch (Exception e) {
                    System.err.println("Error processing media file: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        }
        notificationService.createNotification(post.getUser(), "You created a new post!");
        return savedPost;
    }

    public Map<String, Object> likePost(Long postId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        boolean liked;
        if (post.getLikedUsers().contains(user)) {
            post.getLikedUsers().remove(user);
            post.setLikes(post.getLikes() - 1);
            liked = false;
        } else {
            post.getLikedUsers().add(user);
            post.setLikes(post.getLikes() + 1);
            liked = true;
            notificationService.createNotification(post.getUser(), user.getName() + " liked your post!");
        }

        postRepository.save(post);

        Map<String, Object> result = new HashMap<>();
        result.put("liked", liked);
        result.put("likeCount", post.getLikes());
        return result;
    }


    public void deletePost(Long postId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        postRepository.delete(post);
    }

    public Post updatePost(Long postId, String userEmail, String newContent, MultipartFile[] mediaFiles) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
    
        if (!post.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized to update this post");
        }
    
        if (newContent != null) {
            post.setContent(newContent);
        }
    
        if (mediaFiles != null && mediaFiles.length > 0) {
            // Optional: delete old media
            post.getMediaFiles().clear();
    
            for (MultipartFile file : mediaFiles) {
                String url = fileStorageService.uploadFile(file); // Upload file and get URL
                Media media = new Media();
                media.setUrl(url);
                media.setType(file.getContentType().startsWith("image") ? "image" : "video");
                media.setPost(post);
                mediaRepository.save(media); // Save media entity
                post.addMedia(media);
            }
        }
    
        return postRepository.save(post);
    }
    
   
    @Transactional
    public SharedPost sharePost(Long postId, String userEmail, String shareComment) {
        // Find the user sharing the post
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
        
        // Find the post to be shared
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));
        
        // Create new SharedPost entity
        SharedPost sharedPost = new SharedPost();
        sharedPost.setUser(user);
        sharedPost.setOriginalPost(post);
        sharedPost.setSharedAt(LocalDateTime.now());
        sharedPost.setShareComment(shareComment);
        
        // Save the shared post
        SharedPost savedSharedPost = sharedPostRepository.save(sharedPost);
        
        // Create notification for the original post author
        notificationService.createNotification(
            post.getUser(), 
            user.getName() + " shared your post!"
        );
        
        return savedSharedPost;
    }
    
   
    public List<SharedPostDTO> getSharedPostsByUserId(Long userId) {
        return sharedPostRepository.findByUserIdOrderBySharedAtDesc(userId)
                .stream()
                .map(sharedPost -> {
                    Post originalPost = sharedPost.getOriginalPost();
        
                    // Convert comments to DTOs
                    List<CommentDTO> commentDTOs = originalPost.getComments().stream()
                            .map(comment -> new CommentDTO(
                                comment.getId(),
                                comment.getContent(),
                                comment.getCreatedAt(),
                                comment.getUser().getName()
                            ))
                            .collect(Collectors.toList());
                
                    // Get media URLs
                    List<String> mediaUrls = originalPost.getMediaFiles().stream()
                            .map(Media::getUrl)
                            .collect(Collectors.toList());
                
                    // Create PostDTO for original post
                    PostDTO originalPostDTO = new PostDTO(
                        originalPost.getId(),
                        originalPost.getContent(),
                        originalPost.getLikes(),
                        originalPost.getCreatedAt(),
                        originalPost.getLikedUsers().contains(sharedPost.getUser()), // Set isLiked
                        originalPost.getUser(),
                        commentDTOs,
                        mediaUrls
                    );
                
                    // Create the final SharedPostDTO
                    return new SharedPostDTO(
                        sharedPost.getId(),
                        sharedPost.getSharedAt(),
                        sharedPost.getShareComment(),
                        sharedPost.getUser().getName(),
                        originalPostDTO
                    );
                }).collect(Collectors.toList());
    }
    
    
    public List<SharedPostDTO> getMySharedPosts(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
        
        return sharedPostRepository.findByUserOrderBySharedAtDesc(user)
                .stream()
                .map(this::convertToSharedPostDTO)
                .collect(Collectors.toList());
    }
    
  
    @Transactional
    public void deleteSharedPost(Long sharedPostId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
        
        SharedPost sharedPost = sharedPostRepository.findById(sharedPostId)
                .orElseThrow(() -> new RuntimeException("Shared post not found with ID: " + sharedPostId));
        
        // Verify ownership
        if (!sharedPost.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this shared post");
        }
        
        sharedPostRepository.delete(sharedPost);
    }
    
  
    private SharedPostDTO convertToSharedPostDTO(SharedPost sharedPost) {
        Post originalPost = sharedPost.getOriginalPost();
        
        // Convert comments to DTOs
        List<CommentDTO> commentDTOs = originalPost.getComments().stream()
                .map(comment -> new CommentDTO(
                    comment.getId(),
                    comment.getContent(),
                    comment.getCreatedAt(),
                    comment.getUser().getName()
                ))
                .collect(Collectors.toList());
        
        // Get media URLs
        List<String> mediaUrls = originalPost.getMediaFiles().stream()
                .map(Media::getUrl)
                .collect(Collectors.toList());
        
        // Create PostDTO for original post
        PostDTO originalPostDTO = new PostDTO(
            originalPost.getId(),
            originalPost.getContent(),
            originalPost.getLikes(),
            originalPost.getCreatedAt(),
            originalPost.getLikedUsers().contains(sharedPost.getUser()),
            originalPost.getUser(),
            commentDTOs,
            mediaUrls
        );
        
        // Create the final SharedPostDTO
        return new SharedPostDTO(
            sharedPost.getId(),
            sharedPost.getSharedAt(),
            sharedPost.getShareComment(),
            sharedPost.getUser().getName(),
            originalPostDTO
        );
    }

    
}