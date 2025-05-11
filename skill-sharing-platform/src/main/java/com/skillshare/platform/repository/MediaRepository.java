package com.skillshare.platform.repository;

import com.skillshare.platform.model.Media;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaRepository extends JpaRepository<Media, Long> {
}