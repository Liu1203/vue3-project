package com.example.blog.controller;

import com.example.blog.common.ApiResponse;
import com.example.blog.entity.Article;
import com.example.blog.service.ArticleService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping
    public ApiResponse<List<Article>> getArticles() {
        return ApiResponse.success(articleService.getAllArticles());
    }

    @GetMapping("/{id}")
    public ApiResponse<Article> getArticleById(@PathVariable Long id) {
        Article article = articleService.getArticleById(id);
        return ApiResponse.success(article);
    }

    @PostMapping("/{id}/view")
    public ApiResponse<Void> incrementViewCount(@PathVariable Long id) {
        articleService.incrementViewCount(id);
        return ApiResponse.success(null);
    }

    @PostMapping("/{id}/like")
    public ApiResponse<Void> likeArticle(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ApiResponse.error(401, "未登录");
        }
        articleService.likeArticle(id, userId);
        return ApiResponse.success(null, "点赞成功");
    }

    @DeleteMapping("/{id}/like")
    public ApiResponse<Void> unlikeArticle(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ApiResponse.error(401, "未登录");
        }
        articleService.unlikeArticle(id, userId);
        return ApiResponse.success(null, "取消点赞");
    }
}
