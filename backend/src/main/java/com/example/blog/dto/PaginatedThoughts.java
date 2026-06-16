package com.example.blog.dto;

import com.example.blog.entity.Thought;
import java.util.List;

public class PaginatedThoughts {
    private List<Thought> items;
    private long total;
    private int page;
    private int pageSize;

    public PaginatedThoughts() {}

    public PaginatedThoughts(List<Thought> items, long total, int page, int pageSize) {
        this.items = items;
        this.total = total;
        this.page = page;
        this.pageSize = pageSize;
    }

    public List<Thought> getItems() { return items; }
    public void setItems(List<Thought> items) { this.items = items; }
    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }
}
