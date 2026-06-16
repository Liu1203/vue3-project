import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CommentItem from '../CommentItem.vue'
import type { Comment } from '@/types/api'

function createComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 1,
    articleId: 1,
    author: '张三',
    content: '这是一条评论',
    parentId: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

const baseProps = {
  comment: createComment(),
  replies: [],
  replyTargetId: null,
  submitting: false,
  isLoggedIn: false,
  loggedInName: '',
}

const stubs = {
  NButton: true,
  NAvatar: true,
  NInput: true,
}

describe('CommentItem', () => {
  describe('timeAgo', () => {
    it('不到 60 秒显示"刚刚"', () => {
      const wrapper = mount(CommentItem, {
        props: baseProps,
        global: { stubs },
      })
      expect(wrapper.text()).toContain('刚刚')
    })

    it('显示 X 分钟前', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const wrapper = mount(CommentItem, {
        props: { ...baseProps, comment: createComment({ createdAt: fiveMinAgo }) },
        global: { stubs },
      })
      expect(wrapper.text()).toContain('5 分钟前')
    })

    it('显示 X 小时前', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000).toISOString()
      const wrapper = mount(CommentItem, {
        props: { ...baseProps, comment: createComment({ createdAt: threeHoursAgo }) },
        global: { stubs },
      })
      expect(wrapper.text()).toContain('3 小时前')
    })

    it('显示 X 天前', () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 86400 * 1000).toISOString()
      const wrapper = mount(CommentItem, {
        props: { ...baseProps, comment: createComment({ createdAt: tenDaysAgo }) },
        global: { stubs },
      })
      expect(wrapper.text()).toContain('10 天前')
    })

    it('超过一个月显示日期', () => {
      const oldDate = '2024-01-15T10:00:00.000Z'
      const wrapper = mount(CommentItem, {
        props: { ...baseProps, comment: createComment({ createdAt: oldDate }) },
        global: { stubs },
      })
      expect(wrapper.text()).toContain('2024/1/15')
    })
  })

  describe('isOwner', () => {
    it('未登录时 isOwner 为 false，不显示删除按钮', () => {
      const wrapper = mount(CommentItem, {
        props: { ...baseProps, isLoggedIn: false },
        global: { stubs },
      })
      expect(wrapper.text()).not.toContain('删除')
    })

    it('登录且名称匹配时显示删除按钮', () => {
      const wrapper = mount(CommentItem, {
        props: {
          ...baseProps,
          isLoggedIn: true,
          loggedInName: '张三',
        },
        global: { stubs },
      })
      expect(wrapper.text()).toContain('删除')
    })

    it('登录但名称不匹配时不显示删除按钮', () => {
      const wrapper = mount(CommentItem, {
        props: {
          ...baseProps,
          isLoggedIn: true,
          loggedInName: '李四',
        },
        global: { stubs },
      })
      expect(wrapper.text()).not.toContain('删除')
    })
  })

  describe('markdown 渲染', () => {
    it('渲染粗体语法为 strong 标签', () => {
      const wrapper = mount(CommentItem, {
        props: {
          ...baseProps,
          comment: createComment({ content: '**粗体** 文字' }),
        },
        global: { stubs },
      })
      expect(wrapper.html()).toContain('<strong>粗体</strong>')
    })

    it('渲染代码为 code 标签', () => {
      const wrapper = mount(CommentItem, {
        props: {
          ...baseProps,
          comment: createComment({ content: '这是 `inline code`' }),
        },
        global: { stubs },
      })
      expect(wrapper.html()).toContain('<code>inline code</code>')
    })

    it('html 被转义而非直接渲染', () => {
      const wrapper = mount(CommentItem, {
        props: {
          ...baseProps,
          comment: createComment({ content: '<script>alert("xss")</script>' }),
        },
        global: { stubs },
      })
      expect(wrapper.html()).not.toContain('<script>')
    })
  })

  describe('replyTargetId 匹配时显示回复表单', () => {
    it('replyTargetId 匹配 comment.id 时显示回复表单区域', () => {
      const wrapper = mount(CommentItem, {
        props: { ...baseProps, replyTargetId: 1 },
        global: { stubs },
      })
      expect(wrapper.find('.reply-form-inline').exists()).toBe(true)
    })

    it('replyTargetId 不匹配时不显示回复表单', () => {
      const wrapper = mount(CommentItem, {
        props: { ...baseProps, replyTargetId: 999 },
        global: { stubs },
      })
      expect(wrapper.find('.reply-form-inline').exists()).toBe(false)
    })
  })

  describe('回复子评论嵌套', () => {
    it('有 replies 时渲染子评论', () => {
      const reply: Comment = createComment({ id: 2, content: '子评论' })
      const wrapper = mount(CommentItem, {
        props: {
          ...baseProps,
          replies: [reply],
        },
        global: { stubs },
      })
      expect(wrapper.find('.comment-replies').exists()).toBe(true)
    })
  })
})
