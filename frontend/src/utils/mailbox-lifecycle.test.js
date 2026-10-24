import { describe, it, expect, vi } from 'vitest'
import { credentialAddress, removeMailboxCredentials, completeMailboxSession, deleteMailbox } from './mailbox-lifecycle'
const token = (address, id = 1) => `h.${btoa(JSON.stringify({ address, address_id: id })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')}.sig`

describe('mailbox lifecycle', () => {
    it('decodes display address; rejects malformed credentials', () => {
        expect(credentialAddress(token('a@example.test'))).toBe('a@example.test');
        expect(credentialAddress('not-a-token')).toBe('');
    });
    it('removes all tokens for deleted mailbox but preserves other entries', () => {
        const a = token('a@example.test'), b = token('b@example.test');
        expect(removeMailboxCredentials([a, token('a@example.test', 2), b, 'invalid'], a, 'a@example.test')).toEqual([b, 'invalid']);
    });
    it('handles malformed cache without throwing', () => {
        expect(removeMailboxCredentials(null, 'x', 'x')).toEqual([]);
    });
    it('signals completion before follow-up updates can unmount the login tab', async () => {
        const order = [];
        await completeMailboxSession({ bind: async () => order.push('bind'), refresh: async () => order.push('refresh'), ready: () => order.push('ready'), warning: vi.fn() });
        expect(order).toEqual(['ready', 'bind', 'refresh']);
    });
    it('does not misreport a created mailbox as failed when refresh or bind fails', async () => {
        const ready = vi.fn(), warning = vi.fn();
        await completeMailboxSession({ bind: async () => { throw Error('bind') }, refresh: async () => { throw Error('network') }, ready, warning });
        expect(ready).toHaveBeenCalledOnce();
        expect(warning.mock.calls.map(c => c[0])).toEqual(['bind', 'refresh']);
    });
    function deletion(result = { success: true }) {
        const credential = token('a@example.test');
        return { request: vi.fn().mockResolvedValue(result), target: { credential, address: 'a@example.test' }, cache: () => [credential, token('b@example.test')], writeCache: vi.fn(), currentCredential: () => credential, clearCurrent: vi.fn() };
    }
    it('uses the confirmed credential and clears local data only after success', async () => {
        const d = deletion(); await deleteMailbox(d);
        expect(d.request).toHaveBeenCalledWith('/api/delete_address', { method: 'DELETE', addressJwt: d.target.credential });
        expect(d.clearCurrent).toHaveBeenCalledOnce();
        expect(d.writeCache.mock.calls[0][0]).toEqual([token('b@example.test')]);
    });
    it('retains credentials on HTTP error', async () => {
        const d = deletion(); d.request.mockRejectedValue(Error('403'));
        await expect(deleteMailbox(d)).rejects.toThrow('403');
        expect(d.writeCache).not.toHaveBeenCalled(); expect(d.clearCurrent).not.toHaveBeenCalled();
    });
    it('retains credentials on success:false', async () => {
        const d = deletion({ success: false });
        await expect(deleteMailbox(d)).rejects.toThrow('did not confirm');
        expect(d.writeCache).not.toHaveBeenCalled();
    });
    it('does not clear a different mailbox selected during deletion', async () => {
        const d = deletion(); d.currentCredential = () => token('b@example.test');
        await deleteMailbox(d); expect(d.clearCurrent).not.toHaveBeenCalled(); expect(d.writeCache).toHaveBeenCalledOnce();
    });
    it('clears active credential even if cache storage fails after server deletion', async () => {
        const d = deletion(); d.writeCache.mockImplementation(() => { throw Error('storage full') }); d.cacheWarning = vi.fn();
        await deleteMailbox(d); expect(d.clearCurrent).toHaveBeenCalledOnce(); expect(d.cacheWarning).toHaveBeenCalledOnce();
    });
    it('refuses an empty target without sending a request', async () => {
        const d = deletion(); d.target = null;
        await expect(deleteMailbox(d)).rejects.toThrow('No mailbox'); expect(d.request).not.toHaveBeenCalled();
    });
});
