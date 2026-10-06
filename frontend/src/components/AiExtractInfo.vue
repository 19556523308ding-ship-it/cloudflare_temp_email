<script setup>
import { computed, ref } from 'vue';
import { useScopedI18n } from '@/i18n/app';
import { ContentCopyOutlined, LinkRound, CodeRound, CheckCircleOutlined, ShieldOutlined } from '@vicons/material';
import { useMessage } from 'naive-ui';
import { useGlobalState } from '../store';

const message = useMessage();
const { isDark } = useGlobalState();
const copied = ref(false);

const { t } = useScopedI18n('components.AiExtractInfo');

const props = defineProps({
  metadata: {
    type: String,
    default: null
  },
  compact: {
    type: Boolean,
    default: false
  }
});

const aiExtract = computed(() => {
  if (!props.metadata) return null;
  try {
    const data = JSON.parse(props.metadata);
    return data.ai_extract || null;
  } catch (e) {
    return null;
  }
});

const isAuthCode = computed(() => {
  return aiExtract.value && aiExtract.value.type === 'auth_code';
});

const typeLabel = computed(() => {
  if (!aiExtract.value) return '';
  const typeMap = {
    auth_code: t('authCode'),
    auth_link: t('authLink'),
    service_link: t('serviceLink'),
    subscription_link: t('subscriptionLink'),
    other_link: t('otherLink'),
  };
  return typeMap[aiExtract.value.type] || '';
});

const typeIcon = computed(() => {
  if (!aiExtract.value) return null;
  const iconMap = {
    auth_code: CodeRound,
    auth_link: LinkRound,
    service_link: LinkRound,
    subscription_link: LinkRound,
    other_link: LinkRound,
  };
  return iconMap[aiExtract.value.type] || null;
});

const isLink = computed(() => {
  return aiExtract.value && aiExtract.value.type !== 'auth_code';
});

const displayText = computed(() => {
  if (!aiExtract.value) return '';
  if (aiExtract.value.type === 'auth_code') {
    return aiExtract.value.result;
  }
  return aiExtract.value.result_text || aiExtract.value.result;
});

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(aiExtract.value.result);
    copied.value = true;
    message.success(isAuthCode.value ? `✓ 验证码 ${aiExtract.value.result} 已复制！` : t('copySuccess'));
    setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch (e) {
    message.error(t('copyFailed'));
  }
};

const openLink = () => {
  if (isLink.value && aiExtract.value.result) {
    window.open(aiExtract.value.result, '_blank');
  }
};
</script>

<template>
  <div v-if="aiExtract && aiExtract.result" class="ai-extract-wrapper">
    <!-- 1. 验证码专属大型高亮聚焦卡片（体验核心升级） -->
    <div v-if="isAuthCode && !compact" class="auth-code-hero-banner">
      <div class="banner-top">
        <div class="banner-badge">
          <n-icon :component="ShieldOutlined" class="shield-ic" />
          <span>检测到验证码（时效性凭证）</span>
        </div>
        <span class="source-tag">本地智能提取</span>
      </div>

      <div class="code-spotlight-row">
        <div class="code-number-display" @click="copyToClipboard" title="点击一键复制">
          {{ aiExtract.result }}
        </div>
        <button class="code-copy-action-btn" :class="{ 'copied': copied }" @click="copyToClipboard">
          <n-icon :component="copied ? CheckCircleOutlined : ContentCopyOutlined" />
          <span>{{ copied ? '已复制！' : '复制验证码' }}</span>
        </button>
      </div>
      <div class="code-sub-notice">请及时在注册或验证页面完成填写，验证码通常仅在短期内有效</div>
    </div>

    <!-- 2. 普通链接提取样式 -->
    <div v-else-if="!compact" class="generic-extract-card">
      <div class="generic-header">
        <n-icon :component="typeIcon" />
        <span class="type-name">{{ typeLabel }}</span>
      </div>
      <div class="generic-body">
        <n-ellipsis style="max-width: 480px;">
          {{ displayText }}
        </n-ellipsis>
        <div class="generic-actions">
          <n-button size="small" @click="copyToClipboard" tertiary>
            <template #icon><n-icon :component="ContentCopyOutlined" /></template>
            复制
          </n-button>
          <n-button v-if="isLink" size="small" @click="openLink" type="primary" secondary>
            {{ t('open') }}
          </n-button>
        </div>
      </div>
    </div>

    <!-- 3. 紧凑模式（用于邮件列表等区域） -->
    <div v-else class="compact-extract-badge" @click="copyToClipboard" :class="{ 'code-badge': isAuthCode }">
      <n-icon :component="typeIcon" />
      <span class="badge-text">{{ isAuthCode ? aiExtract.result : displayText }}</span>
      <n-icon :component="ContentCopyOutlined" class="copy-hint" />
    </div>
  </div>
</template>

<style scoped>
.ai-extract-wrapper {
  margin-bottom: 16px;
}

/* 验证码高亮聚焦卡片 */
.auth-code-hero-banner {
  background: linear-gradient(135deg, rgba(240, 253, 244, 0.95), rgba(220, 252, 231, 0.8));
  border: 1.5px solid #86EFAC;
  border-radius: var(--radius-lg, 16px);
  padding: 18px 22px;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.12);
  text-align: left;
}

:deep(.dark-theme) .auth-code-hero-banner,
[data-theme='dark'] .auth-code-hero-banner {
  background: linear-gradient(135deg, rgba(6, 78, 59, 0.45), rgba(4, 47, 46, 0.55));
  border-color: rgba(52, 211, 153, 0.4);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4);
}

.banner-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.banner-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #15803D;
}

:deep(.dark-theme) .banner-badge,
[data-theme='dark'] .banner-badge {
  color: #6EE7B7;
}

.shield-ic {
  font-size: 16px;
}

.source-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.15);
  color: #047857;
  font-weight: 600;
}

:deep(.dark-theme) .source-tag,
[data-theme='dark'] .source-tag {
  background: rgba(52, 211, 153, 0.2);
  color: #A7F3D0;
}

.code-spotlight-row {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 8px;
}

.code-number-display {
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 850;
  font-family: monospace, var(--font-family);
  letter-spacing: 3px;
  color: #14532D;
  background: #FFFFFF;
  padding: 8px 20px;
  border-radius: 12px;
  border: 1.5px solid #BBF7D0;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
  cursor: pointer;
  user-select: all;
  transition: transform 0.15s ease;
}

:deep(.dark-theme) .code-number-display,
[data-theme='dark'] .code-number-display {
  background: #064E3B;
  color: #ECFDF5;
  border-color: #059669;
}

.code-number-display:hover {
  transform: scale(1.02);
}

.code-copy-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  background: #16A34A;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(22, 163, 74, 0.35);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.code-copy-action-btn:hover {
  background: #15803D;
  transform: translateY(-1px);
}

.code-copy-action-btn.copied {
  background: #059669;
}

.code-sub-notice {
  font-size: 12px;
  color: #166534;
  opacity: 0.85;
}

:deep(.dark-theme) .code-sub-notice,
[data-theme='dark'] .code-sub-notice {
  color: #A7F3D0;
}

/* 通用提取 */
.generic-extract-card {
  padding: 14px 18px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  text-align: left;
}

.generic-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--brand-primary);
  margin-bottom: 8px;
}

.generic-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.generic-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 紧凑 Badge */
.compact-extract-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.1);
  color: var(--brand-primary);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.compact-extract-badge.code-badge {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-family: monospace;
  font-weight: 700;
}

.compact-extract-badge:hover {
  opacity: 0.9;
}

.copy-hint {
  font-size: 13px;
  opacity: 0.7;
}
</style>
