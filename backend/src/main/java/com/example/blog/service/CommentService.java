package com.example.blog.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.blog.dto.CreateCommentParams;
import com.example.blog.entity.Comment;
import com.example.blog.entity.CommentLike;
import com.example.blog.entity.User;
import com.example.blog.mapper.CommentLikeMapper;
import com.example.blog.mapper.CommentMapper;
import com.example.blog.mapper.UserMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    private final CommentMapper commentMapper;
    private final CommentLikeMapper commentLikeMapper;
    private final UserMapper userMapper;

    public CommentService(CommentMapper commentMapper, CommentLikeMapper commentLikeMapper, UserMapper userMapper) {
        this.commentMapper = commentMapper;
        this.commentLikeMapper = commentLikeMapper;
        this.userMapper = userMapper;
    }

    public List<Comment> getCommentsByArticleId(Long articleId) {
        List<Comment> comments = commentMapper.selectList(
                new LambdaQueryWrapper<Comment>()
                        .eq(Comment::getArticleId, articleId)
                        .orderByAsc(Comment::getCreatedAt));
        for (Comment c : comments) {
            long count = commentLikeMapper.selectCount(
                    new LambdaQueryWrapper<CommentLike>()
                            .eq(CommentLike::getCommentId, c.getId()));
            c.setLikeCount((int) count);
        }
        return comments;
    }

    public List<Comment> getCommentsByArticleId(Long articleId, Long currentUserId) {
        List<Comment> comments = getCommentsByArticleId(articleId);
        if (currentUserId != null) {
            for (Comment c : comments) {
                long count = commentLikeMapper.selectCount(
                        new LambdaQueryWrapper<CommentLike>()
                                .eq(CommentLike::getCommentId, c.getId())
                                .eq(CommentLike::getUserId, currentUserId));
                c.setLikedByMe(count > 0);
            }
        }
        return comments;
    }

    public Comment createComment(CreateCommentParams params) {
        Comment comment = new Comment();
        comment.setArticleId(params.getArticleId());
        comment.setAuthor(params.getAuthor());
        comment.setAuthorAvatar(params.getAuthorAvatar());
        comment.setContent(params.getContent());
        comment.setLikeCount(0);
        comment.setLikedByMe(false);

        if (params.getParentId() != null) {
            Comment parent = commentMapper.selectById(params.getParentId());
            if (parent != null) {
                comment.setParentId(parent.getParentId() != null ? parent.getParentId() : params.getParentId());
            }
        }

        comment.setCreatedAt(LocalDateTime.now());
        commentMapper.insert(comment);
        return comment;
    }

    public Comment updateComment(Long commentId, String content, Long userId) {
        Comment comment = commentMapper.selectById(commentId);
        if (comment == null) {
            throw new IllegalArgumentException("评论不存在");
        }
        User user = userMapper.selectById(userId);
        if (user == null || !user.getName().equals(comment.getAuthor())) {
            throw new IllegalArgumentException("无权编辑此评论");
        }
        comment.setContent(content);
        commentMapper.updateById(comment);
        return comment;
    }

    public void deleteComment(Long commentId) {
        Comment comment = commentMapper.selectById(commentId);
        if (comment == null) {
            throw new IllegalArgumentException("评论不存在");
        }
        deleteDescendants(commentId);
        commentLikeMapper.delete(new LambdaQueryWrapper<CommentLike>()
                .eq(CommentLike::getCommentId, commentId));
        commentMapper.deleteById(commentId);
    }

    public void likeComment(Long commentId, Long userId) {
        long count = commentLikeMapper.selectCount(
                new LambdaQueryWrapper<CommentLike>()
                        .eq(CommentLike::getCommentId, commentId)
                        .eq(CommentLike::getUserId, userId));
        if (count == 0) {
            CommentLike like = new CommentLike();
            like.setCommentId(commentId);
            like.setUserId(userId);
            commentLikeMapper.insert(like);
        }
    }

    public void unlikeComment(Long commentId, Long userId) {
        commentLikeMapper.delete(
                new LambdaQueryWrapper<CommentLike>()
                        .eq(CommentLike::getCommentId, commentId)
                        .eq(CommentLike::getUserId, userId));
    }

    private void deleteDescendants(Long parentId) {
        List<Comment> children = commentMapper.selectList(
                new LambdaQueryWrapper<Comment>()
                        .eq(Comment::getParentId, parentId));
        for (Comment child : children) {
            deleteDescendants(child.getId());
            commentLikeMapper.delete(new LambdaQueryWrapper<CommentLike>()
                    .eq(CommentLike::getCommentId, child.getId()));
            commentMapper.deleteById(child.getId());
        }
    }
}
