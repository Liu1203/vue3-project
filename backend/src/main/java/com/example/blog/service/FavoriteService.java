package com.example.blog.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.blog.entity.Article;
import com.example.blog.entity.ArticleFavorite;
import com.example.blog.mapper.ArticleFavoriteMapper;
import com.example.blog.mapper.ArticleMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FavoriteService {

    private final ArticleFavoriteMapper favoriteMapper;
    private final ArticleMapper articleMapper;

    public FavoriteService(ArticleFavoriteMapper favoriteMapper, ArticleMapper articleMapper) {
        this.favoriteMapper = favoriteMapper;
        this.articleMapper = articleMapper;
    }

    public void favorite(Long articleId, Long userId) {
        long count = favoriteMapper.selectCount(
                new LambdaQueryWrapper<ArticleFavorite>()
                        .eq(ArticleFavorite::getArticleId, articleId)
                        .eq(ArticleFavorite::getUserId, userId));
        if (count == 0) {
            ArticleFavorite fav = new ArticleFavorite();
            fav.setArticleId(articleId);
            fav.setUserId(userId);
            fav.setCreatedAt(LocalDateTime.now());
            favoriteMapper.insert(fav);
        }
    }

    public void unfavorite(Long articleId, Long userId) {
        favoriteMapper.delete(
                new LambdaQueryWrapper<ArticleFavorite>()
                        .eq(ArticleFavorite::getArticleId, articleId)
                        .eq(ArticleFavorite::getUserId, userId));
    }

    public boolean isFavorited(Long articleId, Long userId) {
        return favoriteMapper.selectCount(
                new LambdaQueryWrapper<ArticleFavorite>()
                        .eq(ArticleFavorite::getArticleId, articleId)
                        .eq(ArticleFavorite::getUserId, userId)) > 0;
    }

    public List<Article> getFavorites(Long userId) {
        List<ArticleFavorite> favs = favoriteMapper.selectList(
                new LambdaQueryWrapper<ArticleFavorite>()
                        .eq(ArticleFavorite::getUserId, userId)
                        .orderByDesc(ArticleFavorite::getCreatedAt));
        return favs.stream()
                .map(f -> articleMapper.selectById(f.getArticleId()))
                .filter(a -> a != null)
                .toList();
    }
}
