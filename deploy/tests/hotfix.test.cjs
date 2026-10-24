const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const setup=fs.readFileSync(__dirname+'/../scripts/index-hotfix-setup.js','utf8');
const token=(address,id=1)=>'header.'+Buffer.from(JSON.stringify({address,address_id:id})).toString('base64url')+'.sig';
function harness(fetch){
 const jwt={value:token('mine@example.test')};
 const state={jwt,addressPassword:{value:'secret'},showAddressCredential:{value:true}};
 const storage=new Map([['LocalAddressCache',JSON.stringify([jwt.value,token('mine@example.test',2),token('other@example.test')])]]);
 const errors=[],successes=[];
 const c={value:true},l={value:true},d={value:true},r={value:{address:'mine@example.test'}};
 const ctx={Qt:()=>state,xn:()=>({error:x=>errors.push(x),warning:()=>{},success:x=>successes.push(x)}),O:value=>({value}),n:{value:'zh'},a:{value:{enableUserDeleteEmail:true}},l,d,c,r,ht:{fetch},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},window:{dispatchEvent:()=>{}},CustomEvent:class{},atob:s=>Buffer.from(s,'base64').toString()};
 vm.createContext(ctx);vm.runInContext(setup+'\nglobalThis.actions={mailDone,mailDelete,mailDeleting};',ctx);
 return {...ctx,state,errors,successes,storage};
}
test('completion closes create and sign-in dialogs',()=>{const h=harness();h.actions.mailDone();assert.equal(h.l.value,false);assert.equal(h.d.value,false)});
test('deletion calls the real endpoint and clears only deleted mailbox',async()=>{let request;const h=harness(async(...args)=>{request=args;return {success:true}});await h.actions.mailDelete();assert.equal(request[0],'/api/delete_address');assert.equal(request[1].method,'DELETE');assert.equal(h.state.jwt.value,'');assert.equal(h.r.value.address,'');assert.equal(h.c.value,false);assert.equal(JSON.parse(h.storage.get('LocalAddressCache')).length,1);assert.equal(h.successes.length,1)});
test('server rejection retains credential and dialog',async()=>{const h=harness(async()=>{throw Error('403 forbidden')});await h.actions.mailDelete();assert.ok(h.state.jwt.value);assert.equal(h.c.value,true);assert.equal(h.errors.length,1);assert.equal(h.actions.mailDeleting.value,false)});
test('false success does not erase mailbox state',async()=>{const h=harness(async()=>({success:false}));await h.actions.mailDelete();assert.ok(h.state.jwt.value);assert.equal(h.successes.length,0)});
test('duplicate confirmation makes one request',async()=>{let resolve,calls=0;const h=harness(()=>{calls++;return new Promise(r=>resolve=r)});const first=h.actions.mailDelete();await h.actions.mailDelete();assert.equal(calls,1);resolve({success:true});await first});
test('disabled deletion sends no request',async()=>{let calls=0;const h=harness(()=>calls++);h.a.value.enableUserDeleteEmail=false;await h.actions.mailDelete();assert.equal(calls,0);assert.ok(h.state.jwt.value)});
test('switching mailbox while delete awaits preserves new selection',async()=>{let resolve;const h=harness(()=>new Promise(r=>resolve=r));const job=h.actions.mailDelete();h.state.jwt.value=token('other@example.test');h.r.value={address:'other@example.test'};resolve({success:true});await job;assert.equal(h.r.value.address,'other@example.test');assert.ok(h.state.jwt.value)});
test('deployed artifact connects both completion listeners and no undefined handler',()=>{const path=__dirname+'/../pages-hotfix/assets';const name=fs.readdirSync(path).find(x=>x.startsWith('index-mailfix-'));const code=fs.readFileSync(path+'/'+name,'utf8');assert.equal((code.match(/onAuthenticated:mailDone/g)||[]).length,2);assert.equal(code.includes('onNewAddress:h.openCreateModal'),false);assert.ok(code.includes('onClick:mailDelete'))});
function creationHarness({createFails=false,settingsFails=false}={}){
 const path=__dirname+'/../pages-hotfix/assets';const name=fs.readdirSync(path).find(x=>x.startsWith('index-mailfix-'));const code=fs.readFileSync(path+'/'+name,'utf8');
 const component=code.slice(code.indexOf('lG={'));const start=component.indexOf('X=async()=>');const end=component.indexOf(',J=async()=>',start);
 assert.ok(start>0&&end>start);
 const events=[],errors=[];const ctx={s:{value:{disableCustomAddressName:false}},h:{value:'test'},b:{value:'normal'},g:{value:''},p:{value:'example.test'},v:{value:''},t:{newAddressPath:async()=>{if(createFails)throw Error('failed');return {jwt:'test-jwt'}},bindUserAddress:async()=>{}},a:{value:''},c:{value:''},l:{value:false},ht:{getSettings:async()=>{if(settingsFails)throw Error('settings failed')}},mailEmit:e=>events.push(e),r:{push:async()=>{}},_o:p=>p,R:{value:'zh'},T:s=>s,n:{error:e=>errors.push(e)}};
 vm.createContext(ctx);vm.runInContext('globalThis.create='+component.slice(start+2,end),ctx);return {...ctx,events,errors};
}
test('actual compiled create success emits modal completion',async()=>{const h=creationHarness();await h.create();assert.deepEqual(h.events,['authenticated']);assert.equal(h.a.value,'test-jwt')});
test('actual compiled create failure does not falsely signal success',async()=>{const h=creationHarness({createFails:true});await h.create();assert.deepEqual(h.events,[]);assert.equal(h.errors.length,1)});
