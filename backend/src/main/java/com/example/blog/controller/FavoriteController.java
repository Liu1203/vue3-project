package com.example.blog.controller;

import com.example.blog.common.ApiResponse;
import com.example.blog.entity.Article;
import com.example.blog.service.FavoriteService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping("/api/articles/{id}/favorite")
    public ApiResponse<Void> favorite(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ApiResponse.error(401, "未登录");
        }
        favoriteService.favorite(id, userId);
        return ApiResponse.success(null, "收藏成功");
    }

    @DeleteMapping("/api/articles/{id}/favorite")
    public ApiResponse<Void> unfavorite(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ApiResponse.error(401, "未登录");
        }
        favoriteService.unfavorite(id, userId);
        return ApiResponse.success(null, "取消收藏");
    }

    @GetMapping("/api/articles/{id}/favorite/check")
    public ApiResponse<Boolean> checkFavorited(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ApiResponse.success(false);
        }
        return ApiResponse.success(favoriteService.isFavorited(id, userId));
    }

    @GetMapping("/api/user/favorites")
    public ApiResponse<List<Article>> getFavorites(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ApiResponse.error(401, "未登录");
        }
        return ApiResponse.success(favoriteService.getFavorites(userId));
    }
}
