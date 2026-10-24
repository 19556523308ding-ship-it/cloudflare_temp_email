"""Guarded patch for the attached deployed build; refuses other versions."""
from pathlib import Path
import hashlib,sys
root=Path(sys.argv[1]); asset=root/'assets/index-BnaRHjD7.js'
assert hashlib.sha256(asset.read_bytes()).hexdigest()=="395442bb6d57c3559c48682b8d926dae277b9e43f65d0c382e6c2ccf342493b0", "Wrong deployed asset; refusing patch"
s=asset.read_text()
# The complete original hash is recorded in patch-manifest.json by packaging.
def replace(old,new):
 global s
 assert s.count(old)==1, f'Expected one anchor: {old[:90]}; got {s.count(old)}'
 s=s.replace(old,new)
replace('lG={__name:"Login",props:', 'lG={__name:"Login",emits:["authenticated"],props:')
replace('setup(e){const t=e,n=xn(),o=P0(),r=Va(),{jwt:a,loading:i,openSettings:s,showAddressCredential:l,userSettings:d,addressPassword:c}=Qt()', 'setup(e,{emit:mailEmit}){const t=e,n=xn(),o=P0(),r=Va(),{jwt:a,loading:i,openSettings:s,showAddressCredential:l,userSettings:d,addressPassword:c}=Qt()')
# Both successful login methods notify the containing modal.
start=s.index('lG={'); end=s.index('const',start+5) # use component boundary below instead
stop=s.index('const ',s.index('newAddressPath(se,j,v.value',start)) if False else s.index('__name:"Index"')
segment=s[start:stop]
anchor='await r.push(_o("/",R.value))'
assert segment.count(anchor)==3
segment=segment.replace(anchor,'mailEmit("authenticated"),'+anchor)
s=s[:start]+segment+s[stop:]
replace('onNewAddress:h.openCreateModal','onNewAddress:()=>{l.value=true}')
replace('["enable-user-delete-email","enable-send-mail","is-s3-enabled","enable-mail-read-status","onNewAddress"]','["enable-user-delete-email","enable-send-mail","is-s3-enabled","enable-mail-read-status"]')
replace('L(Ei,{"default-tab":"register"})','L(Ei,{"default-tab":"register",onAuthenticated:mailDone})')
replace('L(Ei,{"default-tab":"signin"})','L(Ei,{"default-tab":"signin",onAuthenticated:mailDone})')
anchor='f=()=>t.push(_o("/user",n.value));return St'
setup=Path(__file__).with_name('index-hotfix-setup.js').read_text()
replace(anchor,'f=()=>t.push(_o("/user",n.value));'+setup+'return St')
replace('title:z(o)("addressManage"),class:"index__modal index__modal--wide"},{default:H(()=>[z(s)?(m(),F(yv,{key:0})):z(i)?(m(),F(dm,{key:1})):(m(),F(uG,{key:2}))]),_:1}', '''title:mailText("删除邮箱","Delete mailbox"),class:"index__modal","mask-closable":!mailDeleting.value,"close-on-esc":!mailDeleting.value,closable:!mailDeleting.value},{default:H(()=>[S("p",null,mailText("确认永久删除当前邮箱及其中全部邮件？此操作不会删除用户账号。","Permanently delete this mailbox and all its mail? Your user account will remain.")),S("p",{style:{overflowWrap:"anywhere"}},r.value.address),L(y,{type:"error",block:true,loading:mailDeleting.value,disabled:mailDeleting.value,onClick:mailDelete},{default:H(()=>[ye(mailText("确认删除邮箱","Confirm deletion"))]),_:1}),L(y,{block:true,disabled:mailDeleting.value,onClick:()=>{c.value=false}},{default:H(()=>[ye(mailText("取消","Cancel"))]),_:1})]),_:1}''')
# Offer mailbox deletion on narrow-screen layouts too.
replace('w("div",wK,[z(r).fetched?', 'w("div",wK,[z(r).address&&z(a).enableUserDeleteEmail?S("div",{class:"mailfix-mobile-actions"},[L(y,{type:"error",secondary:true,onClick:()=>{c.value=true}},{default:H(()=>[ye(mailText("删除当前邮箱","Delete current mailbox"))]),_:1})]):Ge("",true),z(r).fetched?')
newname='index-mailfix-'+hashlib.sha256(s.encode()).hexdigest()[:12]+'.js'
asset.write_text(s)
asset.rename(asset.with_name(newname))
for p in root.rglob('*'):
 if p.is_file() and p.suffix in ('.js','.html','.css','.json'):
  text=p.read_text(); updated=text.replace('index-BnaRHjD7.js',newname)
  if updated!=text:p.write_text(updated)
with (root/'assets/mailfix.css').open('w') as f:
 f.write('.index__modal{width:min(600px,calc(100vw - 24px))!important;max-height:calc(100dvh - 32px);overflow-y:auto}.index__modal .n-input-group{flex-wrap:wrap}.index__modal .n-button{min-height:40px}.mailfix-mobile-actions{display:none}@media(max-width:768px){.mailfix-mobile-actions{display:flex;justify-content:flex-end;margin:8px 12px}}\n')
p=root/'index.html';p.write_text(p.read_text().replace('</head>','<link rel="stylesheet" href="/assets/mailfix.css">\n</head>'))
print(newname)
# Every JS chunk that may reference the entry gets a new URL as well.
# Keeping the old chunk URL would let cached chunks import a removed entry.
mapping={p.name:p.stem+'-mailfix20261024.js' for p in (root/'assets').glob('*.js') if not p.name.startswith(('index-mailfix-','workbox-'))}
for p in root.rglob('*'):
 if p.is_file() and p.suffix in ('.js','.html','.css','.json'):
  text=p.read_text()
  for old,new in mapping.items():text=text.replace(old,new)
  p.write_text(text)
for old,new in mapping.items():(root/'assets'/old).rename(root/'assets'/new)
