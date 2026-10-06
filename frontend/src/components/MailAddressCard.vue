<template>
  <div class="mail-address-card glass-card" :class="{ 'waiting': isWaiting }">
    <div class="card-header">
      <div class="status-indicator">
        <span class="status-dot"></span>
        <span class="status-text">{{ isWaiting ? '● 正在等待新邮件...' : '● 邮箱就绪' }}</span>
      </div>
      <div class="header-actions">
        <slot name="header-actions"></slot>
      </div>
    </div>

    <div class="address-display-row">
      <div class="email-icon">
        <svg viewBox="0 0 24 24" fill="none" class="icon-svg">
          <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22 6L12 13L2 6" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div class="address-text-container">
        <span class="address-label">当前临时邮箱</span>
        <span class="address-val" :title="address">{{ address || '正在准备邮箱...' }}</span>
      </div>

      <button class="copy-btn" @click="handleCopy" :class="{ 'copied': copied }">
        <svg v-if="!copied" viewBox="0 0 24 24" fill="none" class="action-icon">
          <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M5 15H4C2.9 15 2 14.1 2 13V4C2 2.9 2.9 2 4 2H13C14.1 2 15 2.9 15 4V5" stroke="currentColor" stroke-width="2"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" class="action-icon">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ copied ? '已复制' : '复制邮箱' }}</span>
      </button>
    </div>

    <!-- 底部操作快捷入口 -->
    <div class="card-footer-actions">
      <slot name="footer-actions"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMessage } from 'naive-ui'

const props = defineProps({
  address: {
    type: String,
    default: ''
  },
  isWaiting: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['copy'])
const message = useMessage()
const copied = ref(false)

const handleCopy = async () => {
  if (!props.address) return
  try {
    await navigator.clipboard.writeText(props.address)
    copied.value = true
    message.success('已复制邮箱地址到剪贴板！')
    emit('copy', props.address)
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    message.error('复制失败，请手动选取复制')
  }
}
</script>

<style scoped>
.mail-address-card {
  padding: 22px 24px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-color);
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
  transition: all 0.28s ease;
}

.mail-address-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #38BDF8, #2563EB, #06B6D4);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-success);
}

.status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent-success);
  box-shadow: 0 0 10px var(--accent-success);
  animation: pulseGlow 1.8s infinite ease-in-out;
}

.address-display-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  background: rgba(248, 250, 252, 0.85);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

:deep(.dark-theme) .address-display-row,
[data-theme='dark'] .address-display-row {
  background: rgba(15, 23, 42, 0.7);
}

.email-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-svg {
  width: 24px;
  height: 24px;
}

.address-text-container {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.address-label {
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-muted);
  font-weight: 600;
}

.address-val {
  font-size: 19px;
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace, var(--font-family);
  letter-spacing: -0.3px;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: var(--radius-md);
  border: none;
  background: linear-gradient(135deg, #2563EB, #1D4ED8);
  color: #FFFFFF;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  flex-shrink: 0;
}

.copy-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
  background: linear-gradient(135deg, #3B82F6, #1D4ED8);
}

.copy-btn.copied {
  background: var(--accent-success);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.action-icon {
  width: 16px;
  height: 16px;
}

.card-footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
}
</style>
