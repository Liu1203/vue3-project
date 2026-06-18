<template>
  <div class="admin-users-page">
    <AppHeader />

    <main class="admin-main">
      <div class="admin-container">
        <div class="page-header">
          <div class="header-left">
            <router-link to="/admin" class="back-link">← 返回管理后台</router-link>
            <h1 class="page-title">👥 用户管理</h1>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-value">{{ totalCount }}</span>
            <span class="stat-label">用户总数</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ adminCount }}</span>
            <span class="stat-label">管理员数</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ userCount }}</span>
            <span class="stat-label">普通用户数</span>
          </div>
        </div>

        <div class="table-card">
          <n-data-table
            :columns="columns"
            :data="users"
            :bordered="false"
            :single-line="false"
            :remote="true"
            :pagination="pagination"
            :loading="loading"
            :row-key="(row: User) => row.id"
            striped
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
          />
          <div v-if="users.length === 0 && !loading" class="empty-state">
            <n-empty description="暂无用户" />
          </div>
        </div>
      </div>
    </main>

    <footer class="admin-footer">
      <p>&copy; {{ new Date().getFullYear() }} My Blog Admin</p>
    </footer>

    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      type="error"
      title="确认删除"
      :content="`确定要删除用户「${deleteTarget?.name}」吗？此操作不可撤销。`"
      positive-text="删除"
      negative-text="取消"
      :loading="deleting"
      @positive-click="doDelete"
    />

    <n-modal
      v-model:show="showRoleModal"
      preset="dialog"
      title="修改角色"
      :positive-text="'确认'"
      negative-text="取消"
      :loading="roleSaving"
      @positive-click="doChangeRole"
    >
      <p style="margin: 12px 0 8px;">
        为 <strong>{{ roleTarget?.name }}</strong> 选择角色：
      </p>
      <n-radio-group v-model:value="selectedRole">
        <n-space>
          <n-radio value="user">普通用户</n-radio>
          <n-radio value="admin">管理员</n-radio>
        </n-space>
      </n-radio-group>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NDataTable, NEmpty, NModal, NTag, NRadioGroup, NRadio, NSpace } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import AppHeader from '@/components/AppHeader.vue'
import { message } from '@/utils/message'
import { getAdminUsers, updateUserRole, deleteUser } from '@/api/user'
import { useUserStore } from '@/stores/user'
import type { User } from '@/types/api'

const router = useRouter()
const userStore = useUserStore()

const users = ref<User[]>([])
const loading = ref(true)
const showDeleteModal = ref(false)
const deleteTarget = ref<User | null>(null)
const deleting = ref(false)
const showRoleModal = ref(false)
const roleTarget = ref<User | null>(null)
const selectedRole = ref('user')
const roleSaving = ref(false)

const pagination = reactive({
  pageSize: 10,
  pageCount: 0,
  pageSizes: [10, 20, 50],
  showSizePicker: true,
})

const totalCount = ref(0)

const adminCount = computed(() => users.value.filter(u => u.role === 'admin').length)
const userCount = computed(() => {
  const currentTotal = adminCount.value + users.value.filter(u => u.role !== 'admin').length
  return currentTotal - adminCount.value
})

const currentUserId = computed(() => userStore.userInfo?.id)

const columns: DataTableColumns<User> = [
  { title: 'ID', key: 'id', width: 60 },
  {
    title: '头像',
    key: 'avatar',
    width: 60,
    render(row) {
      return h('div', { style: 'display: flex; align-items: center' }, [
        row.avatar
          ? h('img', { src: row.avatar, style: 'width: 32px; height: 32px; border-radius: 50%; object-fit: cover' })
          : h('div', {
            style: 'width: 32px; height: 32px; border-radius: 50%; background: #e0e0e0; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #888',
          }, row.name.charAt(0)),
      ])
    },
  },
  {
    title: '昵称',
    key: 'name',
    ellipsis: { tooltip: true },
  },
  {
    title: '用户名',
    key: 'username',
    width: 140,
  },
  {
    title: '邮箱',
    key: 'email',
    width: 220,
    ellipsis: { tooltip: true },
  },
  {
    title: '角色',
    key: 'role',
    width: 100,
    render(row) {
      return h(NTag, {
        size: 'small',
        round: true,
        bordered: false,
        type: row.role === 'admin' ? 'error' : 'info',
      }, { default: () => row.role === 'admin' ? '管理员' : '用户' })
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render(row) {
      const isSelf = row.id === currentUserId.value
      return h('div', { style: 'display: flex; gap: 8px' }, [
        h(NButton, {
          size: 'small',
          secondary: true,
          type: 'warning',
          disabled: isSelf,
          onClick: () => { roleTarget.value = row; selectedRole.value = row.role; showRoleModal.value = true },
        }, { default: () => '角色' }),
        h(NButton, {
          size: 'small',
          secondary: true,
          type: 'error',
          disabled: isSelf,
          onClick: () => { deleteTarget.value = row; showDeleteModal.value = true },
        }, { default: () => '删除' }),
      ])
    },
  },
]

onMounted(() => fetchUsers())

async function fetchUsers(page = 1, pageSize?: number) {
  loading.value = true
  try {
    const ps = pageSize ?? pagination.pageSize
    const result = await getAdminUsers(page, ps)
    users.value = result.items
    totalCount.value = result.total
    pagination.pageCount = Math.ceil(result.total / ps)
    pagination.pageSize = ps
  } catch {
    message.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  fetchUsers(page)
}

function handlePageSizeChange(pageSize: number) {
  fetchUsers(1, pageSize)
}

async function doDelete() {
  if (!deleteTarget.value) return false
  deleting.value = true
  try {
    await deleteUser(deleteTarget.value.id)
    message.success('删除成功')
    showDeleteModal.value = false
    deleteTarget.value = null
    await fetchUsers()
    return true
  } catch {
    message.error('删除失败')
    return false
  } finally {
    deleting.value = false
  }
}

async function doChangeRole() {
  if (!roleTarget.value) return false
  if (selectedRole.value === roleTarget.value.role) {
    showRoleModal.value = false
    return false
  }
  roleSaving.value = true
  try {
    await updateUserRole(roleTarget.value.id, selectedRole.value)
    message.success('角色已更新')
    showRoleModal.value = false
    roleTarget.value = null
    await fetchUsers()
    return true
  } catch {
    message.error('更新失败')
    return false
  } finally {
    roleSaving.value = false
  }
}
</script>

<style scoped lang="scss">
$primary: #6366f1;

.admin-users-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-page);
}

.admin-main {
  flex: 1;
  padding: 32px 24px;
}

.admin-container {
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.back-link {
  font-size: 13px;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: $primary;
  }
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--color-bg-card);
  border-radius: 12px;
  padding: 20px 24px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: $primary;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.table-card {
  background: var(--color-bg-card);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  padding-bottom: 24px;
}

.empty-state {
  text-align: center;
  padding: 64px 0;
  color: var(--color-text-muted);
}

.admin-footer {
  text-align: center;
  padding: 20px;
  font-size: 13px;
  color: var(--color-text-muted);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-card);
}
</style>
