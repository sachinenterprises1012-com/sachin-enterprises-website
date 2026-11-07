const ready = window.SUPABASE_URL && window.SUPABASE_ANON_KEY &&
  window.SUPABASE_URL.startsWith("https://") && !window.SUPABASE_URL.includes("PASTE_") &&
  !window.SUPABASE_ANON_KEY.includes("PASTE_");
const client = ready ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;
const el=id=>document.getElementById(id);
function status(id,msg){el(id).textContent=msg;}
if(!ready) status("loginStatus","First complete Supabase setup in README.txt and config.js.");
else checkSession();
el("loginBtn").addEventListener("click",async()=>{
 if(!client)return;
 status("loginStatus","Signing in...");
 const {data,error}=await client.auth.signInWithPassword({email:el("loginEmail").value,password:el("loginPassword").value});
 if(error) status("loginStatus",error.message); else showDashboard(data.session);
});
async function checkSession(){const {data}=await client.auth.getSession();if(data.session)showDashboard(data.session);}
function showDashboard(session){el("loginCard").classList.add("hidden");el("dashboard").classList.remove("hidden");el("logout").classList.remove("hidden");loadMedia();loadEnquiries();loadDocuments();}
el("logout").addEventListener("click",async()=>{await client.auth.signOut();location.reload();});
el("uploadBtn").addEventListener("click",async()=>{
 const files=[...el("mediaFiles").files];if(!files.length){status("uploadStatus","Choose at least one image or video.");return;}
 status("uploadStatus","Uploading...");
 for(const file of files){
   const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]/g,"-");
   const path=Date.now()+"-"+Math.random().toString(36).slice(2,7)+"-"+safe;
   const {error}=await client.storage.from("gallery").upload(path,file,{upsert:false,contentType:file.type});
   if(error){status("uploadStatus","Upload error: "+error.message);return;}
   await client.from("gallery_media").insert({file_path:path,file_name:file.name,mime_type:file.type});
 }
 status("uploadStatus","Upload complete. Refresh your public website to see the media.");el("mediaFiles").value="";loadMedia();
});
async function loadMedia(){
 const {data,error}=await client.from("gallery_media").select("*").order("created_at",{ascending:false});
 if(error){el("mediaList").textContent=error.message;return;}
 el("mediaList").innerHTML="";
 for(const item of data||[]){
  const {data:publicData}=client.storage.from("gallery").getPublicUrl(item.file_path);
  const node=document.createElement(item.mime_type.startsWith("video/")?"video":"img");
  node.src=publicData.publicUrl;if(node.tagName==="VIDEO")node.controls=true;
  const wrap=document.createElement("div");wrap.appendChild(node);
  const label=document.createElement("small");label.textContent=item.file_name;wrap.appendChild(label);
  const del=document.createElement("button");del.className="admin-btn danger";del.textContent="Delete";del.style.marginTop="6px";
  del.onclick=async()=>{if(!confirm("Delete this gallery item?"))return;await client.storage.from("gallery").remove([item.file_path]);await client.from("gallery_media").delete().eq("id",item.id);loadMedia();};
  wrap.appendChild(del);el("mediaList").appendChild(wrap);
 }
}
async function loadEnquiries(){
 const {data,error}=await client.from("enquiries").select("*").order("created_at",{ascending:false}).limit(100);
 if(error){el("enquiries").textContent=error.message;return;}
 el("enquiries").innerHTML="";
 (data||[]).forEach(x=>{const d=document.createElement("div");d.className="record";d.textContent=`${x.name} · ${x.phone} · ${x.created_at?new Date(x.created_at).toLocaleString():""}`;const p=document.createElement("p");p.textContent=x.message;d.appendChild(p);el("enquiries").appendChild(d);});
 if(!data?.length)el("enquiries").textContent="No enquiries received yet.";
}
async function loadDocuments(){
 const {data,error}=await client.from("documents").select("*").order("created_at",{ascending:false}).limit(100);
 if(error){el("documents").textContent=error.message;return;}
 el("documents").innerHTML="";
 (data||[]).forEach(x=>{const d=document.createElement("div");d.className="record";d.textContent=`${x.doc_type} ${x.doc_number} · ${x.customer_name} · ₹${Number(x.total_amount||0).toLocaleString("en-IN")}`;el("documents").appendChild(d);});
 if(!data?.length)el("documents").textContent="No saved documents yet.";
}
