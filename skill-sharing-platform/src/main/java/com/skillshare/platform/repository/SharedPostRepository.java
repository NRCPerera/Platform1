package com.skillshare.platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skillshare.platform.model.SharedPost;
import com.skillshare.platform.model.User;

import java.util.List;

@Repository
public interface SharedPostRepository extends JpaRepository<SharedPost, Long> {
    List<SharedPost> findByUserOrderBySharedAtDesc(User user);
    List<SharedPost> findByUserIdOrderBySharedAtDesc(Long userId);
}