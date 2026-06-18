package com.example.blog.entity;

import com.baomidou.mybatisplus.annotation.TableName;

@TableName("article_like")
public class ArticleLike {
    private Long articleId;
    private Long userId;

    public Long getArticleId() { return articleId; }
    public void setArticleId(Long articleId) { this.articleId = articleId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
