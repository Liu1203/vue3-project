package com.example.blog.controller;

import com.example.blog.common.ApiResponse;
import com.example.blog.dto.LoginParams;
import com.example.blog.dto.LoginResult;
import com.example.blog.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ApiResponse<LoginResult> login(@Valid @RequestBody LoginParams params) {
        LoginResult result = authService.login(params.getUsername(), params.getPassword());
        return ApiResponse.success(result, "登录成功");
    }
}
