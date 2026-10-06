<template>
  <div class="hero-illustration">
    <div class="illustration-container anim-float">
      <svg class="hero-art-svg" viewBox="0 0 540 440" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cloudMainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#E0F2FE" />
            <stop offset="50%" stop-color="#BAE6FD" />
            <stop offset="100%" stop-color="#7DD3FC" />
          </linearGradient>

          <linearGradient id="mailGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#2563EB" stop-opacity="0.9" />
          </linearGradient>

          <linearGradient id="planeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="100%" stop-color="#E2E8F0" />
          </linearGradient>

          <filter id="heroShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#0284C7" flood-opacity="0.18" />
          </filter>
        </defs>

        <!-- 背景发光光晕 Blob -->
        <circle cx="280" cy="220" r="160" fill="url(#mailGlowGrad)" opacity="0.15" filter="blur(40px)" />

        <!-- 装饰小气泡与粒子 -->
        <circle cx="90" cy="110" r="7" fill="#38BDF8" opacity="0.6" class="anim-pulse" />
        <circle cx="450" cy="90" r="12" fill="#60A5FA" opacity="0.5" />
        <circle cx="480" cy="280" r="9" fill="#0284C7" opacity="0.7" />
        <circle cx="80" cy="310" r="14" fill="#BAE6FD" opacity="0.8" />

        <!-- 大朵主体立体云 -->
        <g filter="url(#heroShadow)">
          <!-- 主云层底板 -->
          <path d="M140 280 C110 280 80 255 80 220 C80 188 105 162 136 160 C150 115 192 82 245 82 C308 82 359 128 368 188 C396 193 418 217 418 247 C418 280 391 306 358 306 L140 306 Z" 
                fill="url(#cloudMainGrad)" />
          <!-- 云朵内部高光质感 -->
          <ellipse cx="230" cy="140" rx="65" ry="32" fill="#FFFFFF" opacity="0.45" />
          <ellipse cx="340" cy="210" rx="42" ry="22" fill="#FFFFFF" opacity="0.38" />
        </g>

        <!-- 浮动收件箱 / 验证码弹卡卡片 -->
        <g transform="translate(140, 170)" filter="url(#heroShadow)">
          <rect width="260" height="150" rx="20" fill="#FFFFFF" stroke="#E0F2FE" stroke-width="2" />
          
          <!-- 卡片顶栏 -->
          <circle cx="24" cy="24" r="5" fill="#EF4444" />
          <circle cx="38" cy="24" r="5" fill="#F59E0B" />
          <circle cx="52" cy="24" r="5" fill="#10B981" />

          <!-- 模拟邮件标题与寄件人 -->
          <rect x="24" y="46" width="70" height="12" rx="4" fill="#0284C7" opacity="0.85" />
          <rect x="102" y="46" width="130" height="12" rx="4" fill="#E2E8F0" />
          <rect x="24" y="68" width="160" height="8" rx="3" fill="#CBD5E1" />

          <!-- 高亮验证码模块 -->
          <rect x="24" y="90" width="212" height="42" rx="10" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5" />
          <text x="38" y="116" font-family="monospace" font-size="16" font-weight="bold" fill="#15803D">942 816</text>
          
          <!-- 复制成功徽章 -->
          <rect x="150" y="98" width="74" height="26" rx="6" fill="#16A34A" />
          <text x="165" y="115" font-family="sans-serif" font-size="11" font-weight="600" fill="#FFFFFF">一键复制</text>
        </g>

        <!-- 3D 纸飞机投递轨迹 -->
        <path d="M40 370 Q 220 340 380 150" stroke="#0284C7" stroke-width="2.5" stroke-dasharray="6 6" opacity="0.55" />
        
        <!-- 飞跃的折纸飞机 -->
        <g transform="translate(370, 110) rotate(-15)">
          <polygon points="0,40 50,0 20,48" fill="#F8FAFC" filter="url(#heroShadow)" />
          <polygon points="50,0 20,48 24,62" fill="#CBD5E1" />
          <polygon points="0,40 50,0 12,32" fill="#E2E8F0" />
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.hero-illustration {
  position: relative;
  width: 100%;
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration-container {
  width: 100%;
  filter: drop-shadow(0 20px 30px rgba(2, 132, 199, 0.1));
}

.hero-art-svg {
  width: 100%;
  height: auto;
  display: block;
}
</style>
