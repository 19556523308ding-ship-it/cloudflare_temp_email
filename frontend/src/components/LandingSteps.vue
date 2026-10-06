<template>
  <div class="landing-steps-section">
    <div class="section-badge">极简流程</div>
    <h2 class="section-title">三步快速开启收信</h2>
    <p class="section-desc">无需等待复杂流程，随时随地开启安全的临时邮箱体验</p>

    <div class="steps-container">
      <div class="step-card glass-card" v-for="(item, idx) in steps" :key="idx">
        <div class="step-num-badge">0{{ idx + 1 }}</div>
        <div class="step-icon-box">
          <component :is="item.icon" class="step-svg" />
        </div>
        <h3 class="step-name">{{ item.name }}</h3>
        <p class="step-detail">{{ item.detail }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { h } from 'vue'

const Step1Icon = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('circle', { cx: '12', cy: '12', r: '10' }),
  h('line', { x1: '12', y1: '8', x2: '12', y2: '16' }),
  h('line', { x1: '8', y1: '12', x2: '16', y2: '12' })
])

const Step2Icon = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }),
  h('rect', { x: '8', y: '2', width: '8', height: '4', rx: '1', ry: '1' })
])

const Step3Icon = () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
  h('polyline', { points: '22 4 12 14.01 9 11.01' })
])

const steps = [
  {
    name: '获取专属邮箱',
    detail: '点击首页一键生成或自定义前缀，即刻分配唯一的临时邮箱地址。',
    icon: Step1Icon
  },
  {
    name: '在第三方网站填写',
    detail: '一键复制邮箱地址，在需要注册、测试或接收通知的平台中填写。',
    icon: Step2Icon
  },
  {
    name: '秒级查收验证码',
    detail: '返回本页，新邮件到达实时提醒，智能高亮提取 4-6 位验证码。',
    icon: Step3Icon
  }
]
</script>

<style scoped>
.landing-steps-section {
  text-align: center;
  margin: 54px 0 36px 0;
}

.section-badge {
  display: inline-block;
  padding: 4px 14px;
  background: rgba(59, 130, 246, 0.1);
  color: var(--brand-primary);
  font-size: 12px;
  font-weight: 700;
  border-radius: var(--radius-full);
  margin-bottom: 12px;
}

.section-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-main);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.section-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0 0 32px 0;
}

.steps-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  position: relative;
}

@media (max-width: 768px) {
  .steps-container {
    grid-template-columns: 1fr;
  }
}

.step-card {
  padding: 28px 20px;
  position: relative;
  text-align: left;
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.step-num-badge {
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 28px;
  font-weight: 900;
  font-family: monospace;
  color: rgba(59, 130, 246, 0.12);
  line-height: 1;
}

.step-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.16), rgba(37, 99, 235, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand-primary);
  margin-bottom: 18px;
}

.step-svg {
  width: 24px;
  height: 24px;
}

.step-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 8px 0;
}

.step-detail {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--text-muted);
  margin: 0;
}
</style>
