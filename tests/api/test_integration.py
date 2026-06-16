import requests
import threading
import pytest

BASE_URL = "http://localhost:3456"


class TestUserFlow:
    """用户管理全流程测试：登录 → 查列表 → 查单个 → 创建 → 验证创建结果"""

    def test_login_returns_token_and_userinfo(self, session):
        resp = session.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "123456",
        })
        body = resp.json()
        assert body["code"] == 200, f"登录失败: {body['message']}"
        assert "token" in body["data"], "登录响应缺少 token"
        assert body["data"]["userInfo"]["name"] == "清清", f"用户名不匹配: {body['data']['userInfo']['name']}"

    def test_get_users_list_returns_at_least_10_users(self, session):
        resp = session.get(f"{BASE_URL}/api/users")
        body = resp.json()
        assert body["code"] == 200
        assert len(body["data"]) >= 10, f"用户数不低于 10，实际 {len(body['data'])}"
        assert body["data"][0]["name"] == "张三", f"第一个用户应为张三，实际为 {body['data'][0]['name']}"

    def test_get_user_by_id(self, session):
        resp = session.get(f"{BASE_URL}/api/user/3")
        body = resp.json()
        assert body["code"] == 200
        assert body["data"]["name"] == "王五", f"id=3 应为王五，实际为 {body['data']['name']}"
        assert body["data"]["email"] == "wangwu@example.com"

    def test_get_user_not_found(self, session):
        resp = session.get(f"{BASE_URL}/api/user/999")
        body = resp.json()
        assert body["code"] == 404, f"不存在的用户应返回 404，实际返回 {body['code']}"
        assert body["message"] == "用户不存在"

    def test_create_user_then_verify_in_list(self, session):
        resp = session.post(f"{BASE_URL}/api/user", json={
            "name": "测试用户",
            "email": "test@example.com",
        })
        body = resp.json()
        assert body["code"] == 200, f"创建用户失败: {body['message']}"
        assert body["data"]["name"] == "测试用户"
        assert body["data"]["email"] == "test@example.com"
        new_id = body["data"]["id"]

        resp2 = session.get(f"{BASE_URL}/api/user/{new_id}")
        assert resp2.json()["data"]["name"] == "测试用户", "创建后查询不到新用户"

    def test_create_user_missing_name(self, session):
        resp = session.post(f"{BASE_URL}/api/user", json={"email": "only@email.com"})
        body = resp.json()
        assert body["code"] == 400, f"缺少 name 应返回 400，实际 {body['code']}"
        assert body["message"] == "name 和 email 不能为空"

    def test_create_user_missing_email(self, session):
        resp = session.post(f"{BASE_URL}/api/user", json={"name": "无名氏"})
        body = resp.json()
        assert body["code"] == 400

    def test_create_user_with_empty_strings(self, session):
        resp = session.post(f"{BASE_URL}/api/user", json={"name": "", "email": ""})
        body = resp.json()
        assert body["code"] == 400, f"空字符串应校验失败，实际 {body['code']}"


class TestArticleAndCommentFlow:
    """文章 & 评论完整生命周期测试：查看文章 → 添加评论 → 回复评论 → 删除评论"""

    def test_get_article_list(self, session):
        resp = session.get(f"{BASE_URL}/api/articles")
        body = resp.json()
        assert body["code"] == 200
        assert len(body["data"]) == 9, f"期望 9 篇文章，实际 {len(body['data'])}"
        assert body["data"][0]["title"].startswith("用 Vite")

    def test_get_article_detail(self, session):
        resp = session.get(f"{BASE_URL}/api/articles/4")
        body = resp.json()
        assert body["code"] == 200
        assert body["data"]["title"] == "AI 对前端开发的影响与展望"
        assert body["data"]["category"] == "前沿"
        assert body["data"]["categoryColor"] == "#9b59b6"
        assert "AI" in body["data"]["tags"]

    def test_get_article_not_found(self, session):
        resp = session.get(f"{BASE_URL}/api/articles/999")
        body = resp.json()
        assert body["code"] == 404, f"不存在的文章应返回 404，实际 {body['code']}"
        assert body["message"] == "文章不存在"

    def test_get_comments_of_article(self, session):
        resp = session.get(f"{BASE_URL}/api/articles/2/comments")
        body = resp.json()
        assert body["code"] == 200
        assert len(body["data"]) >= 1, f"文章 2 应至少有 1 条评论，实际 {len(body['data'])}"
        authors = [c["author"] for c in body["data"]]
        assert "小红" in authors, "文章 2 的评论作者应包括 小红"

    def test_create_comment_then_verify(self, session):
        resp = session.post(f"{BASE_URL}/api/articles/1/comments", json={
            "author": "测试用户",
            "content": "这是一条测试评论",
        })
        body = resp.json()
        assert body["code"] == 200, f"创建评论失败: {body['message']}"
        comment_id = body["data"]["id"]
        assert body["data"]["author"] == "测试用户"
        assert body["data"]["parentId"] is None

        resp2 = session.get(f"{BASE_URL}/api/articles/1/comments")
        ids = [c["id"] for c in resp2.json()["data"]]
        assert comment_id in ids, "创建后评论未出现在列表中"

    def test_reply_to_comment(self, session):
        resp = session.post(f"{BASE_URL}/api/articles/9/comments", json={
            "author": "回复者",
            "content": "这是对阿强的回复",
            "parentId": 4,
        })
        body = resp.json()
        assert body["code"] == 200, f"回复评论失败: {body['message']}"
        assert body["data"]["parentId"] == 4, f"parentId 应为 4，实际为 {body['data']['parentId']}"

    def test_reply_to_child_comment_resolves_to_root_parent(self, session):
        parent_resp = session.post(f"{BASE_URL}/api/articles/5/comments", json={
            "author": "父评论作者",
            "content": "这是一条父评论",
        })
        parent_id = parent_resp.json()["data"]["id"]

        session.post(f"{BASE_URL}/api/articles/5/comments", json={
            "author": "子评论作者",
            "content": "回复父评论",
            "parentId": parent_id,
        })

        resp = session.post(f"{BASE_URL}/api/articles/5/comments", json={
            "author": "测试",
            "content": "回复子评论",
            "parentId": parent_id + 1,
        })
        body = resp.json()
        assert body["code"] == 200
        assert body["data"]["parentId"] == parent_id, (
            f"回复子评论应解析到根 parentId={parent_id}，实际为 {body['data']['parentId']}"
        )

    def test_delete_comment_cascades_to_children(self, session):
        resp = session.delete(f"{BASE_URL}/api/comments/4")
        body = resp.json()
        assert body["code"] == 200, f"删除评论失败: {body['message']}"

        resp2 = session.get(f"{BASE_URL}/api/articles/9/comments")
        remaining = resp2.json()["data"]
        remaining_ids = [c["id"] for c in remaining]
        assert 4 not in remaining_ids, "删除后不应包含已删除的评论"
        assert 5 not in remaining_ids, "子评论也应被级联删除"
        assert 6 not in remaining_ids, "子评论也应被级联删除"

    def test_delete_nonexistent_comment(self, session):
        resp = session.delete(f"{BASE_URL}/api/comments/9999")
        body = resp.json()
        assert body["code"] == 404, f"删除不存在的评论应返回 404，实际 {body['code']}"
        assert body["message"] == "评论不存在"


class TestThoughtPagination:
    """想法分页查询测试：默认分页、自定义分页、边界情况"""

    def test_default_pagination(self, session):
        resp = session.get(f"{BASE_URL}/api/thoughts")
        body = resp.json()
        assert body["code"] == 200
        assert body["data"]["total"] == 15
        assert body["data"]["page"] == 1
        assert body["data"]["pageSize"] == 10
        assert len(body["data"]["items"]) == 10, "默认第 1 页应返回 10 条"

    def test_custom_page_size(self, session):
        resp = session.get(f"{BASE_URL}/api/thoughts?page=1&pageSize=5")
        body = resp.json()
        assert body["code"] == 200
        assert body["data"]["pageSize"] == 5
        assert len(body["data"]["items"]) == 5

    def test_second_page(self, session):
        resp = session.get(f"{BASE_URL}/api/thoughts?page=2&pageSize=10")
        body = resp.json()
        assert body["code"] == 200
        assert body["data"]["page"] == 2
        assert len(body["data"]["items"]) == 5, "第 2 页应返回剩余 5 条"

    def test_out_of_range_page_returns_empty_list(self, session):
        resp = session.get(f"{BASE_URL}/api/thoughts?page=100&pageSize=10")
        body = resp.json()
        assert body["code"] == 200
        assert len(body["data"]["items"]) == 0, "超出范围的页码应返回空列表"

    def test_thoughts_sorted_by_date_desc(self, session):
        resp = session.get(f"{BASE_URL}/api/thoughts?pageSize=15")
        items = resp.json()["data"]["items"]
        dates = [item["createdAt"] for item in items]
        sorted_dates = sorted(dates, reverse=True)
        assert dates == sorted_dates, f"想法应按日期降序排列"

    def test_thought_structure(self, session):
        resp = session.get(f"{BASE_URL}/api/thoughts?pageSize=1")
        item = resp.json()["data"]["items"][0]
        assert "id" in item, "想法缺少 id 字段"
        assert "content" in item, "想法缺少 content 字段"
        assert "tags" in item, "想法缺少 tags 字段"
        assert "createdAt" in item, "想法缺少 createdAt 字段"
        assert isinstance(item["tags"], list), "tags 应为数组"


class TestErrorScenarios:
    """异常场景测试：无效请求、边界输入、并发"""

    def test_404_unknown_endpoint(self, session):
        resp = session.get(f"{BASE_URL}/api/unknown")
        assert resp.status_code == 404, f"不存在的接口应返回 404，实际 {resp.status_code}"

    def test_wrong_http_method(self, session):
        resp = session.delete(f"{BASE_URL}/api/articles")
        assert resp.status_code == 404, f"DELETE 文章列表应返回 404，实际 {resp.status_code}"

    def test_invalid_json_body(self, session):
        resp = session.post(
            f"{BASE_URL}/api/auth/login",
            data="这不是 JSON",
            headers={"Content-Type": "application/json"},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["code"] == 400

    def test_create_comment_empty_author(self, session):
        resp = session.post(f"{BASE_URL}/api/articles/1/comments", json={
            "author": "",
            "content": "内容",
        })
        body = resp.json()
        assert body["code"] == 400, f"author 为空应返回 400，实际 {body['code']}"
        assert body["message"] == "author 和 content 不能为空"

    def test_create_comment_empty_content(self, session):
        resp = session.post(f"{BASE_URL}/api/articles/1/comments", json={
            "author": "测试",
            "content": "",
        })
        body = resp.json()
        assert body["code"] == 400

    def test_login_with_empty_fields(self, mock_server):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "",
            "password": "",
        })
        body = resp.json()
        assert body["code"] == 400, f"空用户名密码应返回 400，实际 {body['code']}"
        assert body["message"] == "用户名和密码不能为空"

    def test_malicious_login_input(self, mock_server):
        payloads = [
            {"username": "' OR 1=1 --", "password": "123"},
            {"username": "<script>alert('xss')</script>", "password": "123"},
            {"username": "a", "password": "\u0000"},
        ]
        for payload in payloads:
            resp = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
            body = resp.json()
            assert body["code"] == 400, f"恶意输入应被拒绝，payload={payload}，实际 code={body['code']}"

    def test_concurrent_requests(self, session):
        results = {}
        lock = threading.Lock()

        def request_users():
            resp = session.get(f"{BASE_URL}/api/users")
            with lock:
                results["users"] = resp.status_code

        def request_articles():
            resp = session.get(f"{BASE_URL}/api/articles")
            with lock:
                results["articles"] = resp.status_code

        def request_thoughts():
            resp = session.get(f"{BASE_URL}/api/thoughts")
            with lock:
                results["thoughts"] = resp.status_code

        threads = [
            threading.Thread(target=request_users),
            threading.Thread(target=request_articles),
            threading.Thread(target=request_thoughts),
            threading.Thread(target=request_users),
            threading.Thread(target=request_articles),
        ]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert results.get("users") == 200, f"并发请求 users 失败: {results}"
        assert results.get("articles") == 200, f"并发请求 articles 失败: {results}"
        assert results.get("thoughts") == 200, f"并发请求 thoughts 失败: {results}"

    def test_concurrent_comment_create(self, session):
        def create_comment(idx):
            resp = session.post(f"{BASE_URL}/api/articles/3/comments", json={
                "author": f"并发用户{idx}",
                "content": f"第 {idx} 条并发评论",
            })
            return resp.json()

        threads = []
        results = [None] * 5
        for i in range(5):
            t = threading.Thread(target=lambda i=i: setitem(results, i, create_comment(i)))
            threads.append(t)

        def setitem(lst, idx, val):
            lst[idx] = val

        for t in threads:
            t.start()
        for t in threads:
            t.join()

        codes = [r["code"] for r in results if r]
        assert all(c == 200 for c in codes), f"并发创建评论有失败: {codes}"
        assert len(set(r["data"]["id"] for r in results if r)) == 5, "并发创建的评论 ID 应各不相同"
