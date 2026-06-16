import { test, expect } from '@playwright/test'

test.describe('登录功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('登录成功 - 正确用户名密码', async ({ page }) => {
    await page.fill('input[placeholder*="用户名"]', 'admin')
    await page.fill('input[placeholder*="密码"]', '123456')

    const captcha = await page.evaluate(() => window.__captchaText.value)
    await page.fill('input[placeholder*="验证码"]', captcha)

    await page.click('button:has-text("登 录")')

    await expect(page).toHaveURL(/\/home/, { timeout: 8000 })
  })

  test('登录失败 - 错误密码', async ({ page }) => {
    await page.fill('input[placeholder*="用户名"]', 'admin')
    await page.fill('input[placeholder*="密码"]', 'wrongpass')

    const captcha = await page.evaluate(() => window.__captchaText.value)
    await page.fill('input[placeholder*="验证码"]', captcha)

    await page.click('button:has-text("登 录")')

    await expect(page.getByText('用户名或密码错误')).toBeVisible()
  })

  test('登录失败 - 错误验证码', async ({ page }) => {
    await page.fill('input[placeholder*="用户名"]', 'admin')
    await page.fill('input[placeholder*="密码"]', '123456')
    await page.fill('input[placeholder*="验证码"]', 'XXXX')

    await page.click('button:has-text("登 录")')

    await expect(page.getByText('验证码错误')).toBeVisible()
  })

  test('表单校验 - 空字段无法提交', async ({ page }) => {
    await page.click('button:has-text("登 录")')

    await expect(page.getByText('请输入用户名', { exact: true })).toBeVisible()
  })
})
