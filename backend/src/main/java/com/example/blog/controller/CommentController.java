package com.example.blog.controller;

import com.example.blog.common.ApiResponse;
import com.example.blog.common.JwtUtil;
import com.example.blog.dto.CreateCommentParams;
import com.example.blog.dto.UpdateCommentParams;
import com.example.blog.entity.Comment;
import com.example.blog.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class CommentController {

    private final CommentService commentService;
    private final JwtUtil jwtUtil;

    public CommentController(CommentService commentService, JwtUtil jwtUtil) {
        this.commentService = commentService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/api/articles/{articleId}/comments")
    public ApiResponse<List<Comment>> getComments(@PathVariable Long articleId, HttpServletRequest request) {
        Long userId = getUserIdOptional(request);
        if (userId != null) {
            return ApiResponse.success(commentService.getCommentsByArticleId(articleId, userId));
        }
        return ApiResponse.success(commentService.getCommentsByArticleId(articleId));
    }

    private Long getUserIdOptional(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId != null) return userId;
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            try {
                return jwtUtil.getUserIdFromToken(auth.substring(7));
            } catch (Exception ignored) {}
        }
        return null;
    }

    @PostMapping("/api/articles/{articleId}/comments")
    public ApiResponse<Comment> createComment(
            @PathVariable Long articleId,
            @Valid @RequestBody CreateCommentParams params) {
        params.setArticleId(articleId);
        return ApiResponse.success(commentService.createComment(params), "评论成功");
    }

    @PutMapping("/api/comments/{commentId}")
    public ApiResponse<Comment> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody UpdateCommentParams params,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ApiResponse.error(401, "未登录");
        }
        return ApiResponse.success(commentService.updateComment(commentId, params.getContent(), userId), "编辑成功");
    }

    @DeleteMapping("/api/comments/{commentId}")
    public ApiResponse<Void> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ApiResponse.success(null, "删除成功");
    }

    @PostMapping("/api/comments/{commentId}/like")
    public ApiResponse<Void> likeComment(@PathVariable Long commentId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ApiResponse.error(401, "未登录");
        }
        commentService.likeComment(commentId, userId);
        return ApiResponse.success(null, "点赞成功");
    }

    @DeleteMapping("/api/comments/{commentId}/like")
    public ApiResponse<Void> unlikeComment(@PathVariable Long commentId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ApiResponse.error(401, "未登录");
        }
        commentService.unlikeComment(commentId, userId);
        return ApiResponse.success(null, "取消点赞");
    }
}
