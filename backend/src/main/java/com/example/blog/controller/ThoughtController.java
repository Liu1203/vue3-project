package com.example.blog.controller;

import com.example.blog.common.ApiResponse;
import com.example.blog.dto.PaginatedThoughts;
import com.example.blog.service.ThoughtService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/thoughts")
public class ThoughtController {

    private final ThoughtService thoughtService;

    public ThoughtController(ThoughtService thoughtService) {
        this.thoughtService = thoughtService;
    }

    @GetMapping
    public ApiResponse<PaginatedThoughts> getThoughts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return ApiResponse.success(thoughtService.getThoughts(page, pageSize));
    }
}
