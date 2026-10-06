<template>
  <div class="landing-features-grid">
    <div class="feature-item glass-card" v-for="(feat, idx) in features" :key="idx">
      <div class="feature-icon" :style="{ background: feat.bg, color: feat.color }">
        <component :is="feat.icon" class="feat-svg" />
      </div>
      <h3 class="feature-title">{{ feat.title }}</h3>
      <p class="feature-desc">{{ feat.desc }}</p>
    </div>
  </div>
</template>

<script setup>
import { h } from 'vue'

const LightningIcon = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' })
])

const ShieldIcon = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }),
  h('path', { d: 'm9 12 2 2 4-4' })
])

const MailFastIcon = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h9' }),
  h('polyline', { points: '22,6 12,13 2,6' }),
  h('path', { d: 'm16 19 2 2 4-4' })
])

const CodeExtractIcon = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('rect', { x: '4', y: '4', width: '16', height: '16', rx: '2' }),
  h('path', { d: 'm9 10-2 2 2 2' }),
  h('path', { d: 'm15 10 2 2-2 2' })
])

const features = [
  {
    title: '即时可用',
    desc: '打开网站自动就绪，无需注册账号，5 秒内开启临时收件保护。',
    icon: LightningIcon,
    bg: 'rgba(56, 189, 248, 0.12)',
    color: '#0284C7'
  },
  {
    title: '保护真实邮箱',
    desc: '避免在非信任网站、活动注册时暴露真实主要邮箱，远离垃圾推广。',
    icon: ShieldIcon,
    bg: 'rgba(16, 185, 129, 0.12)',
    color: '#10B981'
  },
  {
    title: '毫秒级收信',
    desc: '基于 Cloudflare 全球边缘节点实时流式接收，信件瞬时入箱，状态呼吸提醒。',
    icon: MailFastIcon,
    bg: 'rgba(59, 130, 246, 0.12)',
    color: '#3B82F6'
  },
  {
    title: '智能验证码提取',
    desc: '邮件内验证码与激活链接自动优先高亮，无需通读正文，一键即可复制使用。',
    icon: CodeExtractIcon,
    bg: 'rgba(147, 51, 234, 0.12)',
    color: '#9333EA'
  }
]
</script>

<style scoped>
.landing-features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin: 36px 0;
}

@media (max-width: 900px) {
  .landing-features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 520px) {
  .landing-features-grid {
    grid-template-columns: 1fr;
  }
}

.feature-item {
  padding: 24px 20px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  border: 1px solid var(--border-color);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;
}

.feature-item:hover {
  transform: translateY(-4px);
}

.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.feat-svg {
  width: 22px;
  height: 22px;
}

.feature-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 8px 0;
}

.feature-desc {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--text-muted);
  margin: 0;
}
</style>
