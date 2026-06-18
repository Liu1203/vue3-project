<template>
  <div class="article-wrapper">
    <AppHeader />
    <div class="progress-bar" :style="{ width: progress + '%' }" />
    <div class="article-page">
      <!-- 返回按钮 -->
      <div class="article-nav">
        <n-button text @click="router.push('/home')" class="back-btn">
          ← 返回首页
        </n-button>
      </div>

      <!-- 加载状态 -->
      <n-spin v-if="!article" size="large" class="loading-spin" />

      <!-- 文章内容 -->
      <article v-else class="article-card">
        <!-- 文章头部 -->
        <header class="article-header">
          <span
            class="article-category"
            :style="{ background: article.categoryColor }"
          >
            {{ article.category }}
          </span>
          <div class="article-meta-right">
            <span class="reading-time">📖 约 {{ readingTime }} 分钟</span>
            <span class="article-date">{{ article.date }}</span>
          </div>
        </header>

        <h1 class="article-title">{{ article.title }}</h1>

        <div class="article-meta">
          <n-tag
            v-for="tag in article.tags"
            :key="tag"
            size="small"
            :bordered="false"
            type="info"
            class="article-tag"
          >
            #{{ tag }}
          </n-tag>
        </div>

        <!-- 分隔线 -->
        <div class="divider" />

        <!-- 互动按钮区 -->
        <div class="article-actions">
          <button
            class="action-btn"
            :class="{ liked: article.likedByMe }"
            @click="handleLike"
          >
            <span class="action-icon">{{ article.likedByMe ? '❤️' : '🤍' }}</span>
            <span class="action-count">{{ article.likeCount ?? 0 }}</span>
          </button>
          <div class="action-btn">
            <span class="action-icon">👁️</span>
            <span class="action-count">{{ article.viewCount ?? 0 }}</span>
          </div>
          <button class="action-btn" @click="handleShare">
            <span class="action-icon">🔗</span>
            <span class="action-label">分享</span>
          </button>
        </div>

        <!-- Markdown 渲染区域 -->
        <div class="article-body" v-html="renderedContent" />

        <!-- 文章底部 -->
        <div class="divider" />
        <div class="article-footer">
          <span>— END —</span>
        </div>

        <!-- 上一篇/下一篇 -->
        <div v-if="prevArticle || nextArticle" class="article-nav-links">
          <n-button
            v-if="prevArticle"
            text
            class="nav-prev"
            @click="router.push(`/article/${prevArticle.id}`)"
          >
            <span class="nav-dir">← 上一篇</span>
            <span class="nav-title">{{ prevArticle.title }}</span>
          </n-button>
          <div v-else />
          <n-button
            v-if="nextArticle"
            text
            class="nav-next"
            @click="router.push(`/article/${nextArticle.id}`)"
          >
            <span class="nav-dir">下一篇 →</span>
            <span class="nav-title">{{ nextArticle.title }}</span>
          </n-button>
        </div>
      </article>

      <!-- 评论区 -->
      <CommentSection v-if="article" :article-id="article.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NTag, NSpin, NButton } from 'naive-ui'
import MarkdownIt from 'markdown-it'
import { getArticleById, getArticles, likeArticle, unlikeArticle, incrementViewCount } from '@/api/article'
import type { ArticleDetail } from '@/api/article'
import AppHeader from '@/components/AppHeader.vue'
import CommentSection from '@/components/CommentSection.vue'
import { message } from '@/utils/message'

const route = useRoute()
const router = useRouter()

const article = ref<ArticleDetail | null>(null)
const allArticles = ref<ArticleDetail[]>([])

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

const renderedContent = computed(() => {
  if (!article.value) return ''
  return md.render(article.value.content)
})

const readingTime = computed(() => {
  if (!article.value) return 0
  const text = article.value.content
  const charCount = text.replace(/\s/g, '').length
  return Math.max(1, Math.ceil(charCount / 400))
})

const currentIndex = computed(() => {
  if (!article.value) return -1
  return allArticles.value.findIndex(a => a.id === article.value!.id)
})

const prevArticle = computed(() => {
  if (currentIndex.value <= 0) return null
  return allArticles.value[currentIndex.value - 1]
})

const nextArticle = computed(() => {
  if (currentIndex.value === -1 || currentIndex.value >= allArticles.value.length - 1) return null
  return allArticles.value[currentIndex.value + 1]
})

const progress = ref(0)
let rafId = 0
function updateProgress() {
  rafId = requestAnimationFrame(() => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    progress.value = docHeight > 0 ? Math.min(window.scrollY / docHeight * 100, 100) : 0
  })
}
onMounted(() => {
  window.addEventListener('scroll', updateProgress, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
  cancelAnimationFrame(rafId)
})

onMounted(async () => {
  const id = Number(route.params.id)
  try {
    const [articleData, articlesData] = await Promise.all([
      getArticleById(id),
      getArticles(),
    ])
    article.value = articleData
    allArticles.value = articlesData
    incrementViewCount(id).catch(() => {})
  } catch {
    router.replace('/home')
  }
})

async function handleLike() {
  if (!article.value) return
  const wasLiked = article.value.likedByMe
  try {
    if (wasLiked) {
      await unlikeArticle(article.value.id)
    } else {
      await likeArticle(article.value.id)
    }
    article.value.likedByMe = !wasLiked
    article.value.likeCount = (article.value.likeCount ?? 0) + (wasLiked ? -1 : 1)
  } catch {
    message.error('操作失败')
  }
}

function handleShare() {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    message.success('链接已复制到剪贴板')
  }).catch(() => {
    message.error('复制失败')
  })
}
</script>

<style scoped lang="scss">
// ===== 变量 =====
$primary: #6366f1;
$primary-light: #8b5cf6;
$bg-page: var(--color-bg-page);
$bg-card: var(--color-bg-card);
$text-primary: var(--color-text-primary);
$text-secondary: var(--color-text-secondary);
$text-muted: var(--color-text-muted);
$border-color: var(--color-border);
$code-bg: #1e1e2e;
$radius: 16px;
$max-width: 760px;

// ===== 页面整体 =====
.article-page {
  min-height: 100vh;
  background: $bg-page;
  padding: 32px 24px 80px;
}

.article-nav {
  max-width: $max-width;
  margin: 0 auto 24px;

  .back-btn {
    font-size: 14px;
    color: $text-secondary;
    transition: color 0.2s;
    padding: 6px 12px;
    border-radius: 8px;

    &:hover {
      color: $primary;
      background: rgba($primary, 0.06);
    }
  }
}

.loading-spin {
  display: flex;
  justify-content: center;
  margin-top: 120px;
}

// ===== 文章卡片 =====
.article-card {
  max-width: $max-width;
  margin: 0 auto;
  background: $bg-card;
  border-radius: $radius;
  padding: 48px 56px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 20px rgba(0, 0, 0, 0.04);
}

// ===== 文章头部 =====
.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .article-category {
    display: inline-block;
    padding: 4px 14px;
    border-radius: 20px;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .article-meta-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .reading-time {
    font-size: 13px;
    color: $text-muted;
  }

  .article-date {
    font-size: 14px;
    color: $text-muted;
    font-weight: 400;
  }
}

// ===== 标题 =====
.article-title {
  margin: 0 0 20px;
  font-size: 32px;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.4;
  letter-spacing: -0.5px;
}

// ===== 标签 =====
.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;

  .article-tag {
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba($primary, 0.2);
    }
  }
}

// ===== 分隔线 =====
.divider {
  height: 1px;
  background: linear-gradient(to right, transparent, $border-color, transparent);
  margin: 32px 0;
}

// ===== 互动按钮 =====
.article-actions {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 32px;

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 20px;
    background: $bg-page;
    border: 1px solid $border-color;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
    color: $text-secondary;

    &:hover {
      border-color: $primary;
      background: rgba($primary, 0.05);
    }

    &.liked {
      color: #e25555;
      border-color: #e25555;
      background: rgba(#e25555, 0.05);
    }

    .action-icon {
      font-size: 16px;
    }

    .action-count {
      font-weight: 500;
    }

    .action-label {
      font-size: 13px;
    }
  }
}

// ===== 文章正文 =====
.article-body {
  font-size: 16px;
  line-height: 1.9;
  color: $text-secondary;

  // 标题
  :deep(h1) {
    font-size: 26px;
    font-weight: 700;
    margin: 40px 0 16px;
    color: $text-primary;
    line-height: 1.3;

    &:first-child {
      margin-top: 0;
    }
  }

  :deep(h2) {
    font-size: 22px;
    font-weight: 700;
    margin: 36px 0 14px;
    color: $text-primary;
    line-height: 1.3;
    padding-bottom: 8px;
    border-bottom: 1px solid $border-color;
  }

  :deep(h3) {
    font-size: 18px;
    font-weight: 600;
    margin: 28px 0 12px;
    color: $text-primary;
  }

  // 段落
  :deep(p) {
    margin: 0 0 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  // 链接
  :deep(a) {
    color: $primary;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;

    &:hover {
      border-bottom-color: $primary;
    }
  }

  // 粗体和斜体
  :deep(strong) {
    color: $text-primary;
    font-weight: 600;
  }

  // 列表
  :deep(ul),
  :deep(ol) {
    padding-left: 24px;
    margin: 12px 0 20px;

    li {
      margin-bottom: 6px;
      color: $text-secondary;
    }
  }

  :deep(ul) {
    list-style: none;

    li {
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: -20px;
        top: 12px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: $primary;
      }
    }
  }

  // 引用块
  :deep(blockquote) {
    margin: 24px 0;
    padding: 16px 20px;
    background: rgba($primary, 0.03);
    border-left: 4px solid $primary;
    border-radius: 0 8px 8px 0;
    color: #555;
    font-style: italic;

    p {
      margin: 0;
    }
  }

  // 代码块
  :deep(pre) {
    background: $code-bg;
    color: #cdd6f4;
    padding: 20px 24px;
    border-radius: 12px;
    overflow-x: auto;
    margin: 24px 0;
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
    font-size: 14px;
    line-height: 1.7;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    code {
      background: none;
      padding: 0;
      color: inherit;
      font-size: inherit;
    }
  }

  // 行内代码
  :deep(code) {
    background: rgba($primary, 0.08);
    color: #d63384;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 0.9em;
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  }

  // 表格
  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 24px 0;
    font-size: 14px;

    th {
      background: rgba($primary, 0.06);
      font-weight: 600;
      color: $text-primary;
      padding: 12px 16px;
      text-align: left;
      border: 1px solid $border-color;
    }

    td {
      padding: 10px 16px;
      border: 1px solid $border-color;
      color: $text-secondary;
    }

    tr:nth-child(even) td {
      background: rgba(0, 0, 0, 0.01);
    }
  }

  // 图片
  :deep(img) {
    max-width: 100%;
    border-radius: 12px;
    margin: 24px 0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  // 水平线
  :deep(hr) {
    border: none;
    height: 2px;
    background: linear-gradient(to right, transparent, $border-color, transparent);
    margin: 40px 0;
  }
}

// ===== 文章底部 =====
.article-footer {
  text-align: center;
  color: $text-muted;
  font-size: 14px;
  letter-spacing: 2px;
  padding-top: 8px;
}

// ===== 上一篇/下一篇 =====
.article-nav-links {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 32px;

  .nav-prev, .nav-next {
    flex: 1;
    text-align: left;
    padding: 16px;
    background: $bg-page;
    border-radius: 12px;
    border: 1px solid $border-color;
    transition: all 0.2s;
    height: auto;
    min-width: 0;

    &:hover {
      border-color: $primary;
      background: rgba($primary, 0.03);
    }
  }

  .nav-next {
    text-align: right;
  }

  .nav-dir {
    display: block;
    font-size: 12px;
    color: $text-muted;
    margin-bottom: 4px;
  }

  .nav-title {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// ===== 响应式 =====
@media (max-width: 768px) {
  .article-page {
    padding: 16px 12px 60px;
  }

  .article-card {
    padding: 28px 20px;
    border-radius: 12px;
  }

  .article-title {
    font-size: 24px;
  }

  .article-body {
    font-size: 15px;

    :deep(h1) {
      font-size: 22px;
    }
    :deep(h2) {
      font-size: 19px;
    }
    :deep(pre) {
      padding: 16px;
      font-size: 13px;
    }
  }
}
</style>