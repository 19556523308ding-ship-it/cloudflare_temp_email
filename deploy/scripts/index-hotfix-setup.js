// Injected inside the verified deployed Index.setup closure (v3).
const {jwt:mailJwt,addressPassword:mailPassword,showAddressCredential:mailCredential}=Qt();
const mailMessage=xn();
const mailDeleting=O(false);
const mailDeleteTarget=O({address:'',credential:''});
const mailText=(zh,en)=>n.value.startsWith('zh')?zh:en;
const mailDone=()=>{l.value=false;d.value=false;};
const mailOpenDelete=()=>{
  mailDeleteTarget.value={address:r.value.address,credential:mailJwt.value};
  c.value=true;
};
const mailDelete=async()=>{
  if(mailDeleting.value)return;
  if(!a.value.enableUserDeleteEmail){
    mailMessage.error(mailText('站点未开放删除邮箱。','Mailbox deletion is disabled.'));
    return;
  }
  const target=mailDeleteTarget.value;
  if(!target?.credential||!target.address){
    mailMessage.error(mailText('未选择有效邮箱。','No mailbox selected.'));
    return;
  }
  mailDeleting.value=true;
  const deletedJwt=target.credential;
  const deletedAddress=target.address;
  try{
    const result=await ht.fetch('/api/delete_address',{method:'DELETE',addressJwt:deletedJwt});
    if(result?.success!==true)throw new Error(mailText('服务器未确认删除成功，请重试。','Server did not confirm deletion. Please retry.'));
    // Remove all credentials for this target address, preserving unrelated mailboxes.
    try{
      const cached=JSON.parse(localStorage.getItem('LocalAddressCache')||'[]');
      const remaining=(Array.isArray(cached)?cached:[]).filter(token=>{
        if(token===deletedJwt)return false;
        try{
          const payload=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
          return payload.address!==deletedAddress;
        }catch{return true;}
      });
      localStorage.setItem('LocalAddressCache',JSON.stringify(remaining));
      window.dispatchEvent(new CustomEvent('vueuse-storage',{
        detail:{key:'LocalAddressCache',oldValue:JSON.stringify(cached),newValue:JSON.stringify(remaining),storageArea:localStorage}
      }));
    }catch{
      mailMessage.warning(mailText('邮箱已删除，但浏览器缓存清理失败。','Mailbox deleted, but browser cache cleanup failed.'));
    }
    if(mailJwt.value===deletedJwt){
      mailJwt.value='';mailPassword.value='';mailCredential.value=false;
      r.value={address:'',send_balance:0,fetched:true};
    }
    c.value=false;
    mailMessage.success(mailText('邮箱及邮件已删除，用户账号保留。','Mailbox and mail deleted. Your user account is unchanged.'));
  }catch(error){
    mailMessage.error(error.message||mailText('删除失败，请重试。','Deletion failed. Please retry.'));
  }finally{mailDeleting.value=false;}
};
