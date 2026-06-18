package com.example.blog.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.blog.entity.User;
import com.example.blog.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

@Service
public class UserService {

    private final UserMapper userMapper;
    private final String uploadPath;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserMapper userMapper,
                       @Value("${app.upload.path:./uploads}") String uploadPath,
                       PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.uploadPath = uploadPath;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userMapper.selectList(null);
    }

    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }

    public User getUserByUsername(String username) {
        return userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, username));
    }

    public User createUser(String name, String email) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setAvatar("");
        user.setPassword("");
        user.setUsername(email);
        userMapper.insert(user);
        return user;
    }

    public String updateAvatar(Long userId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("只支持图片文件");
        }

        String avatarDir = uploadPath + "/avatars";
        try {
            Files.createDirectories(Paths.get(avatarDir));
        } catch (IOException e) {
            throw new RuntimeException("创建头像目录失败: " + e.getMessage(), e);
        }

        String originalFilename = file.getOriginalFilename();
        String ext = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = "avatar_" + userId + "_" + System.currentTimeMillis() + ext;

        File dest = new File(avatarDir, filename);
        try {
            file.transferTo(dest);
        } catch (IOException e) {
            throw new RuntimeException("文件上传失败: " + e.getMessage(), e);
        }

        String avatarUrl = "/uploads/avatars/" + filename;
        User user = userMapper.selectById(userId);
        if (user != null) {
            user.setAvatar(avatarUrl);
            userMapper.updateById(user);
        }
        return avatarUrl;
    }

    public User updateProfile(Long userId, String name, String email) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        if (name != null && !name.isBlank()) {
            user.setName(name);
        }
        if (email != null && !email.isBlank()) {
            User existUser = userMapper.selectOne(new LambdaQueryWrapper<User>()
                    .eq(User::getEmail, email)
                    .ne(User::getId, userId));
            if (existUser != null) {
                throw new IllegalArgumentException("该邮箱已被使用");
            }
            user.setEmail(email);
        }
        userMapper.updateById(user);
        user.setPassword(null);
        return user;
    }

    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("旧密码不正确");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userMapper.updateById(user);
    }
}
