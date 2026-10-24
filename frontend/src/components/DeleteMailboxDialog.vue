<script setup>
import { ref, watch, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { useMessage } from 'naive-ui'
import { useGlobalState } from '../store'
import { api } from '../api'
import { useScopedI18n } from '@/i18n/app'
import { deleteMailbox } from '../utils/mailbox-lifecycle'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['update:show', 'deleted'])
const { jwt, settings, addressPassword, showAddressCredential, openSettings } = useGlobalState()
const { locale, t } = useScopedI18n('views.index.AccountSettings')
const message = useMessage()
const busy = ref(false)
const target = ref(null)
const cache = useLocalStorage('LocalAddressCache', [])
const cancelText = computed(() => locale.value.startsWith('zh') ? '取消' : 'Cancel')
watch(() => props.show, value => {
    if (value && !busy.value) target.value = { credential: jwt.value, address: settings.value.address }
}, { immediate: true })
const close = value => { if (!busy.value) emit('update:show', value) }
const confirm = async () => {
    if (busy.value) return;
    if (!openSettings.value.enableUserDeleteEmail) {
        message.error(locale.value.startsWith('zh') ? '站点未开放删除邮箱' : 'Mailbox deletion is disabled');
        return;
    }
    busy.value = true;
    try {
        await deleteMailbox({
            request: api.fetch,
            target: target.value,
            cache: () => cache.value,
            writeCache: value => { cache.value = value },
            cacheWarning: () => message.warning(locale.value.startsWith('zh')
                ? '邮箱已删除，但浏览器缓存清理失败。' : 'Mailbox deleted, but browser cache cleanup failed.'),
            currentCredential: () => jwt.value,
            clearCurrent: () => {
                jwt.value = '';
                addressPassword.value = '';
                showAddressCredential.value = false;
                settings.value = { address: '', send_balance: 0, fetched: true };
            }
        });
        emit('update:show', false);
        emit('deleted', target.value.address);
        message.success(t('success'));
    } catch (error) {
        message.error(error.message || 'Delete failed');
    } finally { busy.value = false; }
}
</script>

<template>
    <n-modal :show="show" @update:show="close" preset="dialog" :title="t('deleteMailbox')"
        :mask-closable="!busy" :close-on-esc="!busy" :closable="!busy"
        style="width: min(480px, calc(100vw - 24px));">
        <p>{{ t('deleteAccountConfirm') }}</p>
        <p style="overflow-wrap: anywhere;"><strong>{{ target?.address }}</strong></p>
        <template #action>
            <n-button :disabled="busy" @click="close(false)">{{ cancelText }}</n-button>
            <n-button data-testid="confirm-delete-mailbox" type="error" :loading="busy" :disabled="busy" @click="confirm">
                {{ t('deleteMailbox') }}
            </n-button>
        </template>
    </n-modal>
</template>
