<script setup>
import { useScopedI18n } from '@/i18n/app'
import { useGlobalState } from '../store'
import DOMPurify from 'dompurify'
import BrandLogo from '../components/BrandLogo.vue'

const { openSettings } = useGlobalState()
const { t } = useScopedI18n('views.Footer')
</script>

<template>
  <footer class="app-footer">
    <div class="footer-wave-decor"></div>
    <div class="footer-container">
      <div class="footer-main-row">
        <div class="footer-brand-col">
          <BrandLogo :compact="true" />
          <p class="footer-tagline">
            快速、安全、即开即用的云端临时邮箱平台，保护真实邮箱免受垃圾邮件侵扰。
          </p>
        </div>

        <div class="footer-links-col">
          <div class="link-group">
            <span class="group-title">核心服务</span>
            <span class="footer-link">即时临时邮箱</span>
            <span class="footer-link">验证码极速提取</span>
            <span class="footer-link">无痕保护</span>
          </div>
          <div class="link-group">
            <span class="group-title">基础设施</span>
            <span class="footer-link">Cloudflare Workers</span>
            <span class="footer-link">Cloudflare D1 存储</span>
            <span class="footer-link">全球边缘加速</span>
          </div>
        </div>
      </div>

      <div class="footer-bottom-bar">
        <div class="copyright-text">
          {{ t('copyright') }} © 2023-{{ new Date().getFullYear() }} Jinzhai Mail. All rights reserved.
        </div>
        <div v-if="openSettings.copyright" class="custom-copyright" v-html="DOMPurify.sanitize(openSettings.copyright)"></div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  position: relative;
  margin-top: 60px;
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  padding: 40px 0 24px 0;
}

.footer-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-main-row {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .footer-main-row {
    flex-direction: column;
  }
}

.footer-brand-col {
  max-width: 380px;
  text-align: left;
}

.footer-tagline {
  margin-top: 12px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--text-muted);
}

.footer-links-col {
  display: flex;
  gap: 48px;
  text-align: left;
}

@media (max-width: 480px) {
  .footer-links-col {
    gap: 24px;
  }
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 4px;
}

.footer-link {
  font-size: 13px;
  color: var(--text-muted);
  cursor: default;
}

.footer-bottom-bar {
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12.5px;
  color: var(--text-dim);
}

@media (max-width: 600px) {
  .footer-bottom-bar {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
