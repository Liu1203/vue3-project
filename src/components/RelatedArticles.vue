<template>
  <div v-if="articles.length > 0" class="related-articles">
    <h3 class="related-title">相关推荐</h3>
    <div class="related-grid">
      <div
        v-for="article in articles"
        :key="article.id"
        class="related-card"
        @click="router.push(`/article/${article.id}`)"
      >
        <span class="related-category" :style="{ background: article.categoryColor }">
          {{ article.category }}
        </span>
        <h4 class="related-card-title">{{ article.title }}</h4>
        <div class="related-meta">
          <span class="related-date">{{ article.date }}</span>
          <div class="related-tags">
            <span v-for="tag in article.tags.slice(0, 2)" :key="tag" class="related-tag">#{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRelatedArticles } from '@/api/article'
import type { ArticleDetail } from '@/api/article'

const props = defineProps<{
  articleId: number
}>()

const router = useRouter()
const articles = ref<ArticleDetail[]>([])

onMounted(async () => {
  try {
    articles.value = await getRelatedArticles(props.articleId)
  } catch {
    // ignore
  }
})
</script>

<style scoped lang="scss">
$primary: #6366f1;

.related-articles {
  margin-top: 32px;
}

.related-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 16px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.related-card {
  background: var(--color-bg-page);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    border-color: $primary;
  }
}

.related-category {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.related-card-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.related-date {
  font-size: 12px;
  color: var(--color-text-muted);
}

.related-tags {
  display: flex;
  gap: 6px;
}

.related-tag {
  font-size: 11px;
  color: $primary;
}
</style>
