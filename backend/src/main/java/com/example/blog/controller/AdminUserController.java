package com.example.blog.controller;

import com.example.blog.common.ApiResponse;
import com.example.blog.dto.PageResult;
import com.example.blog.entity.User;
import com.example.blog.mapper.UserMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserMapper userMapper;

    public AdminUserController(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    private boolean checkAdmin(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return false;
        User user = userMapper.selectById(userId);
        return user != null && "admin".equals(user.getRole());
    }

    private Long getCurrentUserId(HttpServletRequest request) {
        return (Long) request.getAttribute("userId");
    }

    @GetMapping
    public ApiResponse<PageResult<User>> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            HttpServletRequest request) {
        if (!checkAdmin(request)) return ApiResponse.error(403, "无权限");
        Page<User> pageResult = userMapper.selectPage(new Page<>(page, pageSize), null);
        pageResult.getRecords().forEach(u -> u.setPassword(null));
        return ApiResponse.success(new PageResult<>(
                pageResult.getRecords(),
                pageResult.getTotal(),
                (int) pageResult.getCurrent(),
                (int) pageResult.getSize()));
    }

    @GetMapping("/{id}")
    public ApiResponse<User> getUser(@PathVariable Long id, HttpServletRequest request) {
        if (!checkAdmin(request)) return ApiResponse.error(403, "无权限");
        User user = userMapper.selectById(id);
        if (user == null) return ApiResponse.error(404, "用户不存在");
        user.setPassword(null);
        return ApiResponse.success(user);
    }

    @PutMapping("/{id}/role")
    public ApiResponse<Void> updateRole(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body,
            HttpServletRequest request) {
        if (!checkAdmin(request)) return ApiResponse.error(403, "无权限");
        Long currentUserId = getCurrentUserId(request);
        if (id.equals(currentUserId)) return ApiResponse.error(400, "不能修改自己的角色");
        User user = userMapper.selectById(id);
        if (user == null) return ApiResponse.error(404, "用户不存在");
        String role = body.get("role");
        if (!"user".equals(role) && !"admin".equals(role)) {
            return ApiResponse.error(400, "角色值无效");
        }
        user.setRole(role);
        userMapper.updateById(user);
        return ApiResponse.success(null, "角色已更新");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id, HttpServletRequest request) {
        if (!checkAdmin(request)) return ApiResponse.error(403, "无权限");
        Long currentUserId = getCurrentUserId(request);
        if (id.equals(currentUserId)) return ApiResponse.error(400, "不能删除自己");
        User user = userMapper.selectById(id);
        if (user == null) return ApiResponse.error(404, "用户不存在");
        userMapper.deleteById(id);
        return ApiResponse.success(null, "删除成功");
    }
}
