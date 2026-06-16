import requests


BASE_URL = "http://localhost:3456"


class TestLogin:
    def test_login_success(self, mock_server):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "123456",
        })
        body = resp.json()

        assert resp.status_code == 200, f"期望状态码 200，实际返回 {resp.status_code}"
        assert body["code"] == 200, f"期望业务码 200，实际返回 {body['code']}"
        assert body["data"]["token"] == "mock_token_abc123", f"期望 token 为 mock_token_abc123，实际为 {body['data']['token']}"
        assert body["data"]["userInfo"]["name"] == "清清", f"期望用户名为 清清，实际为 {body['data']['userInfo']['name']}"

    def test_login_wrong_password(self, mock_server):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "wrongpass",
        })
        body = resp.json()

        assert resp.status_code == 200, f"期望状态码 200，实际返回 {resp.status_code}"
        assert body["code"] == 400, f"期望业务码 400，实际返回 {body['code']}"
        assert body["message"] == "用户名或密码错误", f"期望消息为 '用户名或密码错误'，实际为 {body['message']}"

    def test_login_missing_username(self, mock_server):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "password": "123456",
        })
        body = resp.json()

        assert resp.status_code == 200, f"期望状态码 200，实际返回 {resp.status_code}"
        assert body["code"] == 400, f"期望业务码 400，实际返回 {body['code']}"
