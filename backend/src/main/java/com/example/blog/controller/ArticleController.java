package com.example.blog.controller;

import com.example.blog.common.ApiResponse;
import com.example.blog.entity.Article;
import com.example.blog.service.ArticleService;
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
}
