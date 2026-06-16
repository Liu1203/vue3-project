package com.example.blog.service;

import com.example.blog.common.JwtUtil;
import com.example.blog.dto.LoginResult;
import com.example.blog.entity.User;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthService(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    public LoginResult login(String username, String password) {
        User user = userService.getUserByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("用户名或密码错误");
        }
        if (!password.equals(user.getPassword())) {
            throw new IllegalArgumentException("用户名或密码错误");
        }
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        LoginResult.UserInfo userInfo = new LoginResult.UserInfo(
                user.getId(), user.getName(), user.getAvatar());
        return new LoginResult(token, userInfo);
    }
}
