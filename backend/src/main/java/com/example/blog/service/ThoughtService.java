package com.example.blog.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.blog.dto.PaginatedThoughts;
import com.example.blog.entity.Thought;
import com.example.blog.mapper.ThoughtMapper;
import org.springframework.stereotype.Service;

@Service
public class ThoughtService {

    private final ThoughtMapper thoughtMapper;

    public ThoughtService(ThoughtMapper thoughtMapper) {
        this.thoughtMapper = thoughtMapper;
    }

    public PaginatedThoughts getThoughts(int page, int pageSize) {
        Page<Thought> pageObj = thoughtMapper.selectPage(
                new Page<>(page, pageSize),
                new LambdaQueryWrapper<Thought>()
                        .orderByDesc(Thought::getCreatedAt));
        return new PaginatedThoughts(pageObj.getRecords(), pageObj.getTotal(), page, pageSize);
    }
}
