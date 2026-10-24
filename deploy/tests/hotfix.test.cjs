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
 const errors=[],successes=[],warnings=[];
 const c={value:false},l={value:true},d={value:true},r={value:{address:'mine@example.test'}};
 const ctx={
   Qt:()=>state,
   xn:()=>({error:x=>errors.push(x),warning:x=>warnings.push(x),success:x=>successes.push(x)}),
   O:value=>({value}),
   n:{value:'zh'},
   a:{value:{enableUserDeleteEmail:true}},
   l,d,c,r,
   ht:{fetch},
   localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},
   window:{dispatchEvent:()=>{}},
   CustomEvent:class{},
   atob:s=>Buffer.from(s,'base64').toString()
 };
 vm.createContext(ctx);
 vm.runInContext(setup+'\nglobalThis.actions={mailDone,mailDelete,mailDeleting,mailOpenDelete,mailDeleteTarget};',ctx);
 return {...ctx,state,errors,successes,warnings,storage};
}

test('completion closes create and sign-in dialogs',()=>{
  const h=harness();
  h.actions.mailDone();
  assert.equal(h.l.value,false);
  assert.equal(h.d.value,false);
});

test('deletion calls the real endpoint and clears only deleted mailbox',async()=>{
  let request;
  const h=harness(async(...args)=>{request=args;return {success:true}});
  const initialJwt=h.state.jwt.value;
  h.actions.mailOpenDelete();
  assert.equal(h.c.value,true);
  assert.equal(h.actions.mailDeleteTarget.value.address,'mine@example.test');
  await h.actions.mailDelete();
  assert.equal(request[0],'/api/delete_address');
  assert.equal(request[1].method,'DELETE');
  assert.equal(request[1].addressJwt,initialJwt);
  assert.equal(h.state.jwt.value,'');
  assert.equal(h.r.value.address,'');
  assert.equal(h.c.value,false);
  assert.equal(JSON.parse(h.storage.get('LocalAddressCache')).length,1);
  assert.equal(h.successes.length,1);
});

test('server rejection retains credential and dialog',async()=>{
  const h=harness(async()=>{throw Error('403 forbidden')});
  h.actions.mailOpenDelete();
  await h.actions.mailDelete();
  assert.ok(h.state.jwt.value);
  assert.equal(h.c.value,true);
  assert.equal(h.errors.length,1);
  assert.equal(h.actions.mailDeleting.value,false);
});

test('false success does not erase mailbox state',async()=>{
  const h=harness(async()=>({success:false}));
  h.actions.mailOpenDelete();
  await h.actions.mailDelete();
  assert.ok(h.state.jwt.value);
  assert.equal(h.successes.length,0);
});

test('duplicate confirmation makes one request',async()=>{
  let resolve,calls=0;
  const h=harness(()=>{calls++;return new Promise(r=>resolve=r)});
  h.actions.mailOpenDelete();
  const first=h.actions.mailDelete();
  await h.actions.mailDelete();
  assert.equal(calls,1);
  resolve({success:true});
  await first;
});

test('disabled deletion sends no request',async()=>{
  let calls=0;
  const h=harness(()=>calls++);
  h.a.value.enableUserDeleteEmail=false;
  h.actions.mailOpenDelete();
  await h.actions.mailDelete();
  assert.equal(calls,0);
  assert.ok(h.state.jwt.value);
});

test('switching mailbox while delete awaits preserves new selection',async()=>{
  let resolve;
  const h=harness(()=>new Promise(r=>resolve=r));
  h.actions.mailOpenDelete();
  const job=h.actions.mailDelete();
  h.state.jwt.value=token('other@example.test');
  h.r.value={address:'other@example.test'};
  resolve({success:true});
  await job;
  assert.equal(h.r.value.address,'other@example.test');
  assert.ok(h.state.jwt.value);
});

test('deployed artifact connects both completion listeners and no undefined handler',()=>{
  const path='C:/Users/HONOR/WorkBuddy/金寨邮件bug修复/v3-work/assets';
  const name=fs.readdirSync(path).find(x=>x.startsWith('index-mailfix-'));
  const code=fs.readFileSync(path+'/'+name,'utf8');
  assert.equal((code.match(/onAuthenticated:mailDone/g)||[]).length,2);
  assert.equal(code.includes('onNewAddress:h.openCreateModal'),false);
  assert.ok(code.includes('onClick:mailDelete'));
});

function creationHarness({createFails=false,settingsFails=false,newAddressDelay=0}={}){
  const path='C:/Users/HONOR/WorkBuddy/金寨邮件bug修复/v3-work/assets';
  const name=fs.readdirSync(path).find(x=>x.startsWith('index-mailfix-'));
  const code=fs.readFileSync(path+'/'+name,'utf8');
  const component=code.slice(code.indexOf('lG={'));
  const start=component.indexOf('X=async()=>');
  const end=component.indexOf(',J=async()=>',start);
  assert.ok(start>0&&end>start);
  const events=[],errors=[],warnings=[],pushHistory=[];
  let createCalls=0,settingsCalls=0;
  const ctx={
    mailBusy:{value:false},
    s:{value:{disableCustomAddressName:false}},
    h:{value:'test'},
    b:{value:'normal'},
    g:{value:''},
    p:{value:'example.test'},
    v:{value:''},
    t:{
      newAddressPath:async()=>{
        createCalls++;
        if(newAddressDelay)await new Promise(r=>setTimeout(r,newAddressDelay));
        if(createFails)throw Error('create failed');
        return {jwt:'test-jwt'};
      },
      bindUserAddress:async()=>{}
    },
    a:{value:''},
    c:{value:''},
    l:{value:false},
    ht:{
      getSettings:async()=>{
        settingsCalls++;
        if(settingsFails)throw Error('settings failed');
      }
    },
    mailEmit:e=>events.push(e),
    r:{push:async path=>pushHistory.push(path)},
    _o:p=>p,
    R:{value:'zh'},
    T:s=>s,
    n:{
      error:e=>errors.push(e),
      warning:w=>warnings.push(w)
    }
  };
  vm.createContext(ctx);
  vm.runInContext('globalThis.create='+component.slice(start+2,end),ctx);
  return {
    ...ctx,events,errors,warnings,
    getCreateCalls:()=>createCalls,
    getSettingsCalls:()=>settingsCalls
  };
}

test('actual compiled create success emits modal completion',async()=>{
  const h=creationHarness();
  await h.create();
  assert.deepEqual(h.events,['authenticated']);
  assert.equal(h.a.value,'test-jwt');
});

test('actual compiled create failure does not falsely signal success',async()=>{
  const h=creationHarness({createFails:true});
  await h.create();
  assert.deepEqual(h.events,[]);
  assert.equal(h.errors.length,1);
});

// P1-A: T-A1 模拟创建 200 + settings 500
test('T-A1: create 200 + settings 500 preserves credential, closes dialog, emits authenticated, shows warning',async()=>{
  const h=creationHarness({settingsFails:true});
  await h.create();
  // 必须立即关闭弹窗/完成认证
  assert.deepEqual(h.events,['authenticated']);
  assert.equal(h.a.value,'test-jwt');
  assert.equal(h.getCreateCalls(),1);
  // 等待微任务中的后台刷新完成
  await new Promise(r=>setTimeout(r,10));
  assert.equal(h.warnings.length,1);
  assert.match(h.warnings[0],/邮箱已创建/);
});

// P1-A: T-A2 并发点击创建操作防抖互斥
test('T-A2: concurrent create attempts fire only 1 network request',async()=>{
  const h=creationHarness({newAddressDelay:50});
  const p1=h.create();
  const p2=h.create();
  await Promise.all([p1,p2]);
  assert.equal(h.getCreateCalls(),1);
});

// P1-B: T-B1 真实包装器竞态测试：延迟 fingerprint，期间切换全局 JWT，DELETE Authorization 仍为目标 A
test('T-B1: delayed fingerprint with changed global JWT still sends target A credential in Authorization',async()=>{
  const path='C:/Users/HONOR/WorkBuddy/金寨邮件bug修复/v3-work/assets';
  const name=fs.readdirSync(path).find(x=>x.startsWith('index-mailfix-'));
  const code=fs.readFileSync(path+'/'+name,'utf8');
  // 提取 il 函数
  const ilStart=code.indexOf('il=async(');
  const ilEnd=code.indexOf(',wW=async(');
  assert.ok(ilStart>0&&ilEnd>ilStart);
  
  let capturedHeaders=null;
  const globalJwt={value:token('mailbox-B@example.test')};
  const targetJwt=token('mailbox-A@example.test');
  
  const ctx={
    iv:{value:false},
    kU:async()=>{
      // 模拟指纹异步采集延迟，在此期间全局 JWT 被篡改/切换为 B
      await new Promise(r=>setTimeout(r,20));
      globalJwt.value=token('mailbox-C-tampered@example.test');
      return 'fp-12345';
    },
    Pf:{global:{locale:{value:'zh'}}},
    Yn:x=>x,
    I1:x=>x?`Bearer ${x}`:undefined,
    dd:{value:''},
    ci:{value:{access_token:''}},
    pW:{value:''},
    hW:{value:''},
    Gl:globalJwt,
    U1:{
      request:async(url,opts)=>{
        capturedHeaders=opts.headers;
        return {status:200,data:{success:true}};
      }
    },
    bW:async(url,res)=>res,
    bi:{isAdminAuthError:()=>false,isSiteAuthError:()=>false},
    gW:{value:false},
    H1:{value:false}
  };
  vm.createContext(ctx);
  vm.runInContext('globalThis.fetch='+code.slice(ilStart+3,ilEnd),ctx);
  
  // 传入 addressJwt 为 targetJwt
  const res=await ctx.fetch('/api/delete_address',{method:'DELETE',addressJwt:targetJwt});
  assert.deepEqual(res,{success:true});
  assert.equal(capturedHeaders.Authorization,`Bearer ${targetJwt}`);
  assert.notEqual(capturedHeaders.Authorization,`Bearer ${globalJwt.value}`);
});

// P1-B: T-B2 删除 A 成功后，若当前选中 B，B 凭据保留，用户账号保留
test('T-B2: deleting target A preserves currently active mailbox B and cache',async()=>{
  const tokenA=token('mailbox-A@example.test');
  const tokenB=token('mailbox-B@example.test');
  const h=harness(async()=>({success:true}));
  
  // 打开确认窗，锁定目标为 A
  h.state.jwt.value=tokenA;
  h.r.value.address='mailbox-A@example.test';
  h.actions.mailOpenDelete();
  assert.equal(h.actions.mailDeleteTarget.value.credential,tokenA);
  
  // 在确认窗开启状态下，切换到邮箱 B
  h.state.jwt.value=tokenB;
  h.r.value.address='mailbox-B@example.test';
  
  // 执行删除
  await h.actions.mailDelete();
  
  // 当前选中的邮箱 B 保持不变，未被清空
  assert.equal(h.state.jwt.value,tokenB);
  assert.equal(h.r.value.address,'mailbox-B@example.test');
  assert.equal(h.c.value,false);
  assert.equal(h.successes.length,1);
});
