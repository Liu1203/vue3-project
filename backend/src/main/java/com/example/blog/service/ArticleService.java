package com.example.blog.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.example.blog.entity.Article;
import com.example.blog.entity.ArticleLike;
import com.example.blog.mapper.ArticleLikeMapper;
import com.example.blog.mapper.ArticleMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ArticleService {

    private final ArticleMapper articleMapper;
    private final ArticleLikeMapper articleLikeMapper;

    public ArticleService(ArticleMapper articleMapper, ArticleLikeMapper articleLikeMapper) {
        this.articleMapper = articleMapper;
        this.articleLikeMapper = articleLikeMapper;
    }

    public List<Article> getAllArticles() {
        return articleMapper.selectList(null);
    }

    public Article getArticleById(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw new IllegalArgumentException("文章不存在");
        }
        return article;
    }

    public void incrementViewCount(Long id) {
        articleMapper.update(null,
                new LambdaUpdateWrapper<Article>()
                        .eq(Article::getId, id)
                        .setSql("view_count = view_count + 1"));
    }

    public void likeArticle(Long articleId, Long userId) {
        long count = articleLikeMapper.selectCount(
                new LambdaQueryWrapper<ArticleLike>()
                        .eq(ArticleLike::getArticleId, articleId)
                        .eq(ArticleLike::getUserId, userId));
        if (count == 0) {
            ArticleLike like = new ArticleLike();
            like.setArticleId(articleId);
            like.setUserId(userId);
            articleLikeMapper.insert(like);
            articleMapper.update(null,
                    new LambdaUpdateWrapper<Article>()
                            .eq(Article::getId, articleId)
                            .setSql("like_count = like_count + 1"));
        }
    }

    public void unlikeArticle(Long articleId, Long userId) {
        long deleted = articleLikeMapper.delete(
                new LambdaQueryWrapper<ArticleLike>()
                        .eq(ArticleLike::getArticleId, articleId)
                        .eq(ArticleLike::getUserId, userId));
        if (deleted > 0) {
            articleMapper.update(null,
                    new LambdaUpdateWrapper<Article>()
                            .eq(Article::getId, articleId)
                            .setSql("like_count = like_count - 1"));
        }
    }
}
