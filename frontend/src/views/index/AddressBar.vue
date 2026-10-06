<script setup>
import { onMounted, ref, computed } from 'vue'
import { useScopedI18n } from '@/i18n/app'
import { useRouter } from 'vue-router'
import { User, ExchangeAlt, Redo, Plus, SignInAlt } from '@vicons/fa'
import { CheckCircleOutlineRound, MailOutlineRound, SecurityOutlined, SpeedOutlined } from '@vicons/material'

import { useGlobalState } from '../../store'
import { api } from '../../api'
import Login from '../common/Login.vue'
import TelegramAddress from './TelegramAddress.vue'
import LocalAddress from './LocalAddress.vue'
import AddressManagement from '../user/AddressManagement.vue'
import { getRouterPathWithLang } from '../../utils'
import AddressSelect from '../../components/AddressSelect.vue'
import AddressCredentialModal from '../../components/AddressCredentialModal.vue'
import MailAddressCard from '../../components/MailAddressCard.vue'
import HeroIllustration from '../../components/HeroIllustration.vue'
import LandingFeatures from '../../components/LandingFeatures.vue'
import LandingSteps from '../../components/LandingSteps.vue'

const router = useRouter()

const {
    jwt, settings, showAddressCredential, userJwt,
    isTelegram, addressPassword, openSettings, loading
} = useGlobalState()

const { locale, t } = useScopedI18n('views.index.AddressBar')

const showAddressManage = ref(false)
const showCreateModal = ref(false)
const showLoginModal = ref(false)

const onUserLogin = async () => {
    await router.push(getRouterPathWithLang("/user", locale.value))
}

const onRefreshAddress = async () => {
    try {
        await api.getSettings();
    } catch (e) {
        console.error(e);
    }
}

// 快速创建随机新邮箱
const quickCreateRandom = async () => {
    showCreateModal.value = true;
}

onMounted(async () => {
    await api.getSettings();
});
</script>

<template>
    <div class="jinzhai-address-hero">
        <n-card :bordered="false" embedded v-if="!settings.fetched">
            <n-skeleton style="height: 50vh" />
        </n-card>

        <!-- 场景 1: 用户已有邮箱（正常收信工作台模式） -->
        <div v-else-if="settings.address" class="active-workspace-hero">
            <div class="workspace-card-wrap">
                <MailAddressCard :address="settings.address" :is-waiting="true">
                    <template #header-actions>
                        <n-button-group size="small">
                            <n-button tertiary type="primary" @click="showAddressManage = true">
                                <template #icon><n-icon :component="ExchangeAlt" /></template>
                                {{ t('addressManage') }}
                            </n-button>
                            <n-button tertiary @click="onRefreshAddress" :loading="loading">
                                <template #icon><n-icon :component="Redo" /></template>
                                刷新
                            </n-button>
                        </n-button-group>
                    </template>

                    <template #footer-actions>
                        <AddressSelect :show-copy="false">
                            <template #actions>
                                <span class="workspace-sub-tip">可下拉切换历史生成的临时地址</span>
                            </template>
                        </AddressSelect>
                    </template>
                </MailAddressCard>
            </div>
        </div>

        <div v-else-if="isTelegram">
            <TelegramAddress />
        </div>

        <div v-else-if="userJwt" class="center">
            <n-card :bordered="false" embedded style="max-width: 900px; width: 100%;">
                <AddressManagement />
            </n-card>
        </div>

        <!-- 场景 2: 全新访客 / 未分配邮箱（即开即用 Landing 视觉核心） -->
        <div v-else class="hero-landing-wrapper">
            <div class="hero-main-banner">
                <!-- 左侧 55%：核心价值与邮箱生成触发区 -->
                <div class="hero-content-col">
                    <div class="hero-headline-badge">
                        <span class="badge-dot"></span>
                        <span>秒级即开即用 · 保护真实邮箱</span>
                    </div>

                    <h1 class="hero-main-title">
                        一个临时邮箱，<br>
                        <span class="gradient-text">立刻开始收信</span>
                    </h1>

                    <p class="hero-sub-description">
                        无需注册，即开即用。避免在陌生的活动、网站注册时暴露主邮箱，验证码、激活链接、测试邮件毫秒级极速接收。
                    </p>

                    <!-- 三大保障标签 -->
                    <div class="hero-pill-tags">
                        <span class="pill-item">
                            <n-icon :component="CheckCircleOutlineRound" class="pill-icon" /> 免费使用
                        </span>
                        <span class="pill-item">
                            <n-icon :component="CheckCircleOutlineRound" class="pill-icon" /> 无需注册
                        </span>
                        <span class="pill-item">
                            <n-icon :component="CheckCircleOutlineRound" class="pill-icon" /> 极速收信
                        </span>
                    </div>

                    <!-- 首页核心操作区：主按钮生成新邮箱，次按钮登录/凭证 -->
                    <div class="hero-actions-container">
                        <button class="primary-hero-btn" @click="quickCreateRandom">
                            <svg viewBox="0 0 24 24" fill="none" class="btn-icon">
                                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                            </svg>
                            <span>生成新临时邮箱</span>
                        </button>

                        <button class="secondary-hero-btn" @click="showLoginModal = true">
                            <svg viewBox="0 0 24 24" fill="none" class="btn-icon">
                                <path d="M15 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H15M10 17L15 12L10 7M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>登录已有邮箱 / 凭据</span>
                        </button>
                    </div>

                    <div class="hero-footnote">
                        <span>● 基于全球云端网络部署，安全保护每一封信件</span>
                    </div>
                </div>

                <!-- 右侧 45%：清新品牌插画 -->
                <div class="hero-art-col">
                    <HeroIllustration />
                </div>
            </div>

            <!-- 下半部分：四大优势卡片 -->
            <LandingFeatures />

            <!-- 三步指引 -->
            <LandingSteps />
        </div>

        <!-- 凭据与地址弹窗 -->
        <AddressCredentialModal v-model:show="showAddressCredential" :address="settings.address" :jwt="jwt"
            :address-password="addressPassword" />

        <!-- 邮箱管理弹窗 -->
        <n-modal v-model:show="showAddressManage" preset="card" :title="t('addressManage')"
            style="width: 720px; max-width: 95vw;">
            <TelegramAddress v-if="isTelegram" />
            <AddressManagement v-else-if="userJwt" />
            <LocalAddress v-else />
        </n-modal>

        <!-- 创建邮箱弹窗 -->
        <n-modal v-model:show="showCreateModal" preset="card" title="创建临时邮箱" style="width: 600px; max-width: 95vw;">
            <Login default-tab="register" />
        </n-modal>

        <!-- 登录已有邮箱弹窗 -->
        <n-modal v-model:show="showLoginModal" preset="card" title="登录已有临时邮箱" style="width: 600px; max-width: 95vw;">
            <Login default-tab="signin" />
            <n-divider />
            <n-button @click="onUserLogin" type="primary" block secondary strong>
                <template #icon><n-icon :component="User" /></template>
                {{ t('userCenter') }}
            </n-button>
        </n-modal>
    </div>
</template>

<style scoped>
.jinzhai-address-hero {
    width: 100%;
}

.workspace-card-wrap {
    max-width: 960px;
    margin: 18px auto 20px auto;
}

.workspace-sub-tip {
    font-size: 12.5px;
    color: var(--text-muted);
}

.hero-landing-wrapper {
    max-width: 1140px;
    margin: 0 auto;
    padding: 10px 16px 40px 16px;
}

.hero-main-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
    padding: 40px 0 20px 0;
    text-align: left;
}

@media (max-width: 960px) {
    .hero-main-banner {
        flex-direction: column-reverse;
        text-align: center;
        padding: 20px 0;
    }
}

.hero-content-col {
    flex: 1;
    max-width: 620px;
}

@media (max-width: 960px) {
    .hero-content-col {
        max-width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
}

.hero-art-col {
    flex: 0 0 auto;
    width: 440px;
    display: flex;
    justify-content: center;
}

@media (max-width: 960px) {
    .hero-art-col {
        width: 100%;
        max-width: 380px;
    }
}

.hero-headline-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: var(--radius-full);
    background: rgba(59, 130, 246, 0.1);
    color: var(--brand-primary);
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 20px;
}

.badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #0284C7;
    animation: pulseGlow 2s infinite ease-in-out;
}

.hero-main-title {
    font-size: clamp(32px, 5vw, 48px);
    font-weight: 850;
    line-height: 1.2;
    letter-spacing: -0.03em;
    color: var(--text-main);
    margin: 0 0 16px 0;
}

.gradient-text {
    background: linear-gradient(135deg, #0284C7 0%, #2563EB 50%, #06B6D4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.hero-sub-description {
    font-size: 16px;
    line-height: 1.65;
    color: var(--text-muted);
    margin: 0 0 24px 0;
    max-width: 520px;
}

.hero-pill-tags {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
}

.pill-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13.5px;
    font-weight: 600;
    color: var(--text-main);
}

.pill-icon {
    font-size: 16px;
    color: var(--accent-success);
}

.hero-actions-container {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
}

@media (max-width: 560px) {
    .hero-actions-container {
        flex-direction: column;
        width: 100%;
    }
}

.primary-hero-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px 28px;
    border-radius: var(--radius-md);
    border: none;
    background: linear-gradient(135deg, #2563EB, #1D4ED8);
    color: #FFFFFF;
    font-size: 15.5px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.primary-hero-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(37, 99, 235, 0.45);
    background: linear-gradient(135deg, #3B82F6, #1D4ED8);
}

.secondary-hero-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px 22px;
    border-radius: var(--radius-md);
    border: 1.5px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-main);
    font-size: 14.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.secondary-hero-btn:hover {
    border-color: var(--brand-primary);
    background: var(--bg-subtle);
    color: var(--brand-primary);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.hero-footnote {
    font-size: 12.5px;
    color: var(--text-dim);
}

.center {
    display: flex;
    text-align: left;
    place-items: center;
    justify-content: center;
    margin: 20px;
}
</style>
