package com.example.blog.controller;

import com.example.blog.common.ApiResponse;
import com.example.blog.dto.CreateCommentParams;
import com.example.blog.entity.Comment;
import com.example.blog.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/api/articles/{articleId}/comments")
    public ApiResponse<List<Comment>> getComments(@PathVariable Long articleId) {
        return ApiResponse.success(commentService.getCommentsByArticleId(articleId));
    }

    @PostMapping("/api/articles/{articleId}/comments")
    public ApiResponse<Comment> createComment(
            @PathVariable Long articleId,
            @Valid @RequestBody CreateCommentParams params) {
        params.setArticleId(articleId);
        return ApiResponse.success(commentService.createComment(params), "评论成功");
    }

    @DeleteMapping("/api/comments/{commentId}")
    public ApiResponse<Void> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ApiResponse.success(null, "删除成功");
    }
}
