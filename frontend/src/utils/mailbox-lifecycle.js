// UI-only decoding. Authorization always remains on the Worker.
export function credentialAddress(token) {
    try {
        const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(part));
        return typeof payload.address === 'string' ? payload.address : '';
    } catch { return ''; }
}

export function removeMailboxCredentials(cache, credential, address) {
    if (!Array.isArray(cache)) return [];
    return cache.filter(token => token !== credential &&
        (!address || credentialAddress(token) !== address));
}

// Creation/login has already succeeded. A secondary failure must not turn it
// into a failed create, which encourages users to create another mailbox.
export async function completeMailboxSession({ bind, refresh, ready, warning }) {
    // Notify before follow-up updates can unmount the login tab.
    ready();
    for (const [stage, action] of [['bind', bind], ['refresh', refresh]]) {
        try { await action(); } catch (error) { warning(stage, error); }
    }
}

export async function deleteMailbox({ request, target, cache, currentCredential, clearCurrent, writeCache, cacheWarning = () => {} }) {
    if (!target?.credential || !target.address) throw new Error('No mailbox selected');
    const result = await request('/api/delete_address', {
        method: 'DELETE', addressJwt: target.credential
    });
    if (result?.success !== true) throw new Error('Server did not confirm mailbox deletion');
    try { writeCache(removeMailboxCredentials(cache(), target.credential, target.address)); }
    catch (error) { cacheWarning(error); }
    if (currentCredential() === target.credential) clearCurrent();
    return result;
}
