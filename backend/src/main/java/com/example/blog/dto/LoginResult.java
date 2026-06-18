package com.example.blog.dto;

public class LoginResult {
    private String token;
    private UserInfo userInfo;

    public LoginResult() {}

    public LoginResult(String token, UserInfo userInfo) {
        this.token = token;
        this.userInfo = userInfo;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public UserInfo getUserInfo() { return userInfo; }
    public void setUserInfo(UserInfo userInfo) { this.userInfo = userInfo; }

    public static class UserInfo {
        private Long id;
        private String name;
        private String avatar;
        private String role;

        public UserInfo() {}

        public UserInfo(Long id, String name, String avatar, String role) {
            this.id = id;
            this.name = name;
            this.avatar = avatar;
            this.role = role;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}
