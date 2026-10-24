"""Guarded patch for the attached deployed build; refuses other versions."""
from pathlib import Path
import hashlib, sys

root = Path(sys.argv[1])
asset = root / 'assets/index-BnaRHjD7.js'
assert hashlib.sha256(asset.read_bytes()).hexdigest() == "395442bb6d57c3559c48682b8d926dae277b9e43f65d0c382e6c2ccf342493b0", "Wrong deployed asset; refusing patch"
s = asset.read_text()

def replace(old, new):
    global s
    assert s.count(old) == 1, f'Expected one anchor: {old[:90]}; got {s.count(old)}'
    s = s.replace(old, new)

# 1. Login component: add authenticated emit and sessionBusy
replace('lG={__name:"Login",props:', 'lG={__name:"Login",emits:["authenticated"],props:')
replace(
    'setup(e){const t=e,n=xn(),o=P0(),r=Va(),{jwt:a,loading:i,openSettings:s,showAddressCredential:l,userSettings:d,addressPassword:c}=Qt()',
    'setup(e,{emit:mailEmit}){const t=e,n=xn(),o=P0(),r=Va(),{jwt:a,loading:i,openSettings:s,showAddressCredential:l,userSettings:d,addressPassword:c}=Qt(),mailBusy=O(!1)'
)

# 2. Add authenticated emit to login methods
start = s.index('lG={'); stop = s.index('__name:"Index"')
segment = s[start:stop]
anchor = 'await r.push(_o("/",R.value))'
assert segment.count(anchor) == 3
segment = segment.replace(anchor, 'mailEmit("authenticated"),' + anchor)
s = s[:start] + segment + s[stop:]

# 3. P1-A: Decouple creation and getSettings / bindUserAddress
old_creation = 'X=async()=>{try{const se=s.value.disableCustomAddressName?"":h.value,j=b.value==="custom"?`${g.value.trim()}.${p.value}`:p.value,ee=await t.newAddressPath(se,j,v.value,b.value==="random");a.value=ee.jwt,c.value=ee.password||"",await ht.getSettings(),mailEmit("authenticated"),await r.push(_o("/",R.value)),l.value=!0;try{await t.bindUserAddress()}catch(te){n.error(`${T("bindUserAddressError")}: ${te.message}`)}}catch(se){n.error(se.message||"error")}}'
new_creation = 'X=async()=>{if(mailBusy.value)return;mailBusy.value=!0;try{const se=s.value.disableCustomAddressName?"":h.value,j=b.value==="custom"?`${g.value.trim()}.${p.value}`:p.value,ee=await t.newAddressPath(se,j,v.value,b.value==="random");if(!ee?.jwt)throw new Error("Invalid response");a.value=ee.jwt,c.value=ee.password||"",mailEmit("authenticated"),await r.push(_o("/",R.value)),l.value=!0;(async()=>{try{await ht.getSettings()}catch(te){n.warning(R.value.startsWith("zh")?"邮箱已创建，但信息刷新失败":"Mailbox created, but details could not be refreshed")}try{await t.bindUserAddress()}catch(te){n.error(`${T("bindUserAddressError")}: ${te.message}`)}})()}catch(se){n.error(se.message||"error")}finally{mailBusy.value=!1}}'
replace(old_creation, new_creation)

# 4. P1-B: Add addressJwt support to ht.fetch (il function)
old_il_auth = 'const l=Yn(hW.value);l&&(r["x-admin-auth"]=l);const d=I1(Gl.value);d&&(r.Authorization=d);'
new_il_auth = 'const l=Yn(hW.value);l&&(r["x-admin-auth"]=l);const d=I1(t.addressJwt||Gl.value);d&&(r.Authorization=d);'
replace(old_il_auth, new_il_auth)

# 5. Connect new-address & delete-address dialogs
replace('onNewAddress:h.openCreateModal', 'onNewAddress:()=>{l.value=true}')
replace('["enable-user-delete-email","enable-send-mail","is-s3-enabled","enable-mail-read-status","onNewAddress"]', '["enable-user-delete-email","enable-send-mail","is-s3-enabled","enable-mail-read-status"]')
replace('L(Ei,{"default-tab":"register"})', 'L(Ei,{"default-tab":"register",onAuthenticated:mailDone})')
replace('L(Ei,{"default-tab":"signin"})', 'L(Ei,{"default-tab":"signin",onAuthenticated:mailDone})')

# 6. Inject index-hotfix-setup.js inside Index setup
setup = Path(__file__).with_name('index-hotfix-setup.js').read_text()
replace('f=()=>t.push(_o("/user",n.value));return St', 'f=()=>t.push(_o("/user",n.value));' + setup + 'return St')

# 7. Render delete modal with mailDeleteTarget.value.address
old_del_modal = 'title:z(o)("addressManage"),class:"index__modal index__modal--wide"},{default:H(()=>[z(s)?(m(),F(yv,{key:0})):z(i)?(m(),F(dm,{key:1})):(m(),F(uG,{key:2}))]),_:1}'
new_del_modal = '''title:mailText("删除邮箱","Delete mailbox"),class:"index__modal","mask-closable":!mailDeleting.value,"close-on-esc":!mailDeleting.value,closable:!mailDeleting.value},{default:H(()=>[S("p",null,mailText("确认永久删除当前邮箱及其中全部邮件？此操作不会删除用户账号。","Permanently delete this mailbox and all its mail? Your user account will remain.")),S("p",{style:{overflowWrap:"anywhere"}},mailDeleteTarget.value.address),L(y,{type:"error",block:true,loading:mailDeleting.value,disabled:mailDeleting.value,onClick:mailDelete},{default:H(()=>[ye(mailText("确认删除邮箱","Confirm deletion"))]),_:1}),L(y,{block:true,disabled:mailDeleting.value,onClick:()=>{c.value=false}},{default:H(()=>[ye(mailText("取消","Cancel"))]),_:1})]),_:1}'''
replace(old_del_modal, new_del_modal)

# 8. Use mailOpenDelete on desktop & mobile
replace('w("div",wK,[z(r).fetched?', 'w("div",wK,[z(r).address&&z(a).enableUserDeleteEmail?S("div",{class:"mailfix-mobile-actions"},[L(y,{type:"error",secondary:true,onClick:mailOpenDelete},{default:H(()=>[ye(mailText("删除当前邮箱","Delete current mailbox"))]),_:1})]):Ge("",true),z(r).fetched?')
replace('onDeleteAddress:p[0]||(p[0]=P=>c.value=!0)', 'onDeleteAddress:mailOpenDelete')

# 9. Rename output
newname = 'index-mailfix-' + hashlib.sha256(s.encode()).hexdigest()[:12] + '.js'
asset.write_text(s)
asset.rename(asset.with_name(newname))

for p in root.rglob('*'):
    if p.is_file() and p.suffix in ('.js', '.html', '.css', '.json'):
        text = p.read_text()
        updated = text.replace('index-BnaRHjD7.js', newname)
        if updated != text:
            p.write_text(updated)

with (root / 'assets/mailfix.css').open('w') as f:
    f.write('.index__modal{width:min(600px,calc(100vw - 24px))!important;max-height:calc(100dvh - 32px);overflow-y:auto}.index__modal .n-input-group{flex-wrap:wrap}.index__modal .n-button{min-height:40px}.mailfix-mobile-actions{display:none}@media(max-width:768px){.mailfix-mobile-actions{display:flex;justify-content:flex-end;margin:8px 12px}}\n')

p = root / 'index.html'
p.write_text(p.read_text().replace('</head>', '<link rel="stylesheet" href="/assets/mailfix.css">\n</head>'))

mapping = {p.name: p.stem + '-mailfix20261024.js' for p in (root / 'assets').glob('*.js') if not p.name.startswith(('index-mailfix-', 'workbox-'))}
for p in root.rglob('*'):
    if p.is_file() and p.suffix in ('.js', '.html', '.css', '.json'):
        text = p.read_text()
        for old, new in mapping.items():
            text = text.replace(old, new)
        p.write_text(text)
for old, new in mapping.items():
    (root / 'assets' / old).rename(root / 'assets' / new)

print(newname)
