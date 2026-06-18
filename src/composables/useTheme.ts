import { ref } from 'vue'

const saved = localStorage.getItem('theme')
const isDark = ref(saved === 'dark')

document.documentElement.classList.toggle('dark', isDark.value)

export function useTheme() {
  function toggle() {
    document.documentElement.classList.add('theme-transitioning')
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning')
    }, 500)
  }

  return { isDark, toggle }
}
