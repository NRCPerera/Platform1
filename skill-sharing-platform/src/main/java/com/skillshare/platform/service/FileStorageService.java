package com.skillshare.platform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    @Value("${file.base-url:http://localhost:8081/media}")
    private String baseUrl;
    
    public String uploadFile(MultipartFile file) {
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String filename = UUID.randomUUID().toString() + 
                              (originalFilename != null ? "-" + originalFilename : "");
            Path filePath = uploadPath.resolve(filename);
            
            // Save the file with overwrite option
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Return URL for accessing the file
            return baseUrl + "/" + filename;
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to store file locally: " + e.getMessage(), e);
        }
    }
}