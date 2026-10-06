<template>
  <div class="brand-logo" :class="{ 'compact': compact }">
    <div class="logo-icon-wrapper">
      <svg class="logo-svg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38BDF8" />
            <stop offset="100%" stop-color="#2563EB" />
          </linearGradient>
          <linearGradient id="mailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="100%" stop-color="#F0F9FF" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#1E40AF" flood-opacity="0.25" />
          </filter>
        </defs>

        <!-- 云朵主体 -->
        <path d="M14 34H35C39.4183 34 43 30.4183 43 26C43 21.849 39.8407 18.4357 35.7925 18.0416C34.7214 12.3533 29.7483 8 23.75 8C17.1503 8 11.751 13.0645 11.2678 19.5393C7.22728 20.3541 4 23.9575 4 28.25C4 32.8063 7.69365 36.5 12.25 36.5H14" 
              fill="url(#cloudGrad)" />
        
        <!-- 跃动信封 -->
        <g filter="url(#softShadow)">
          <rect x="13" y="17" width="22" height="15" rx="3.5" fill="url(#mailGrad)" stroke="#38BDF8" stroke-width="1.2" />
          <!-- 信封翻折线条 -->
          <path d="M14 18.5L24 25.5L34 18.5" stroke="#2563EB" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          <!-- 闪烁电波点 -->
          <circle cx="24" cy="21.5" r="1.8" fill="#0284C7" />
        </g>
      </svg>
    </div>
    <div class="logo-text" v-if="!iconOnly">
      <span class="logo-title">Jinzhai<span class="title-accent">Mail</span></span>
      <span class="logo-badge" v-if="!compact">金寨云邮</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  compact: {
    type: Boolean,
    default: false
  },
  iconOnly: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  text-decoration: none;
}

.logo-icon-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(37, 99, 235, 0.08));
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.brand-logo:hover .logo-icon-wrapper {
  transform: scale(1.08) rotate(3deg);
}

.logo-svg {
  width: 32px;
  height: 32px;
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.logo-title {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--text-main, #0F172A);
  font-family: var(--font-family);
}

.title-accent {
  background: linear-gradient(135deg, #0284C7, #2563EB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-left: 2px;
}

.logo-badge {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--brand-primary, #3B82F6);
  letter-spacing: 0.5px;
}

.brand-logo.compact .logo-icon-wrapper {
  width: 34px;
  height: 34px;
}

.brand-logo.compact .logo-title {
  font-size: 16px;
}
</style>
