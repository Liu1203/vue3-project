<template>
  <Teleport to="body">
    <Transition name="lightbox-fade">
      <div v-if="visible" class="lightbox-overlay" @click.self="close">
        <button class="lightbox-close" @click="close">&times;</button>
        <div class="lightbox-content">
          <img
            :src="currentSrc"
            :alt="currentAlt"
            class="lightbox-img"
            :class="{ loaded: imgLoaded }"
            @load="imgLoaded = true"
          />
        </div>
        <template v-if="images.length > 1">
          <button class="lightbox-prev" @click="prev">&#8249;</button>
          <button class="lightbox-next" @click="next">&#8250;</button>
          <div class="lightbox-counter">{{ currentIndex + 1 }} / {{ images.length }}</div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  images: { src: string; alt?: string }[]
  initialIndex?: number
}>()

const emit = defineEmits<{ close: [] }>()

const visible = ref(true)
const currentIndex = ref(props.initialIndex ?? 0)
const imgLoaded = ref(false)

const currentSrc = computed(() => props.images[currentIndex.value]?.src ?? '')
const currentAlt = computed(() => props.images[currentIndex.value]?.alt ?? '')

watch(currentIndex, () => { imgLoaded.value = false })

function close() {
  visible.value = false
  emit('close')
}

function prev() {
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

function next() {
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped lang="scss">
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-content {
  max-width: 90vw;
  max-height: 85vh;
}

.lightbox-img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 4px;
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 0.3s, transform 0.3s;

  &.loaded {
    opacity: 1;
    transform: scale(1);
  }
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 24px;
  background: none;
  border: none;
  color: #fff;
  font-size: 36px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  z-index: 1;
  &:hover { opacity: 1; }
}

.lightbox-prev,
.lightbox-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  font-size: 40px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { background: rgba(255, 255, 255, 0.2); }
}

.lightbox-prev { left: 20px; }
.lightbox-next { right: 20px; }

.lightbox-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.3s;
}
.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}
</style>
