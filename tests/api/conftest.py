import pytest
import subprocess
import time
import os
import requests

BASE_URL = "http://localhost:3456"
MOCK_SERVER = os.path.join(os.path.dirname(__file__), "mock-server.ts")
PROJECT_ROOT = os.path.join(os.path.dirname(__file__), "../..")


def wait_for_server(url, timeout=15):
    for _ in range(timeout * 2):
        try:
            resp = requests.get(url, timeout=1)
            return True
        except requests.ConnectionError:
            time.sleep(0.5)
    return False


@pytest.fixture(scope="session")
def mock_server():
    subprocess.run(
        'powershell -c "Get-Process -Id (Get-NetTCPConnection -LocalPort 3456 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"',
        shell=True, capture_output=True,
    )
    server = subprocess.Popen(
        f'npx tsx "{MOCK_SERVER}"',
        cwd=PROJECT_ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        shell=True,
    )
    started = wait_for_server(f"{BASE_URL}/health")
    assert started, "Mock server 启动失败"
    yield
    server.terminate()
    server.wait()


@pytest.fixture
def api(mock_server):
    return BASE_URL


@pytest.fixture
def session(api):
    sess = requests.Session()
    resp = sess.post(f"{api}/api/auth/login", json={
        "username": "admin",
        "password": "123456",
    })
    body = resp.json()
    assert body["code"] == 200, f"登录失败: {body}"
    sess.headers["Authorization"] = f"Bearer {body['data']['token']}"
    return sess
