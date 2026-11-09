const BUSINESS_EMAIL="sachinenterprises1012@gmail.com";
const $=id=>document.getElementById(id);
const ready=window.SUPABASE_URL&&window.SUPABASE_ANON_KEY&&window.SUPABASE_URL.startsWith("https://")&&!window.SUPABASE_URL.includes("PASTE_")&&!window.SUPABASE_ANON_KEY.includes("PASTE_");
const cloud=ready?window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY):null;

$("year").textContent=new Date().getFullYear();
$("menuToggle").addEventListener("click",()=>$("nav").classList.toggle("open"));
document.querySelectorAll("#nav a").forEach(a=>a.addEventListener("click",()=>$("nav").classList.remove("open")));

let publicGalleryItems=[];
let activeGalleryCategory="All";

function galleryCategory(item){
  return item.vehicle_category || "Other";
}
function renderPublicGallery(){
  const grid=$("galleryGrid");
  if(!grid)return;
  grid.classList.add("public-gallery-grid");
  const visible=activeGalleryCategory==="All"
    ? publicGalleryItems
    : publicGalleryItems.filter(item=>galleryCategory(item)===activeGalleryCategory);
  grid.innerHTML="";
  if(!visible.length){
    const empty=document.createElement("div");
    empty.className="gallery-empty";
    empty.textContent=publicGalleryItems.length
      ? "No photos are available in this category yet."
      : "Vehicle photos will appear here soon.";
    grid.appendChild(empty);
    return;
  }
  visible.forEach(item=>{
    const {data:storageData}=cloud.storage.from("gallery").getPublicUrl(item.file_path);
    const card=document.createElement("article");
    card.className="public-gallery-card";
    const isVideo=(item.mime_type||"").startsWith("video/");
    const media=document.createElement(isVideo?"video":"img");
    media.className="gallery-media";
    media.src=storageData.publicUrl;
    if(isVideo){media.controls=true;media.preload="metadata";}
    else {media.alt=item.title||item.vehicle_name||item.file_name||"Sachin Enterprises vehicle";}
    const copy=document.createElement("div");
    copy.className="gallery-card-copy";
    const title=document.createElement("strong");
    title.className="gallery-card-title";
    title.textContent=item.title||item.vehicle_name||item.file_name||"Vehicle photo";
    const meta=document.createElement("div");
    meta.className="gallery-card-meta";
    [item.vehicle_category,item.vehicle_name,item.photo_type].filter(Boolean).forEach(value=>{
      const tag=document.createElement("span");
      tag.className="gallery-tag";
      tag.textContent=value;
      meta.appendChild(tag);
    });
    copy.append(title,meta);
    card.append(media,copy);
    grid.appendChild(card);
  });
}
async function loadPublicGallery(){
  const grid=$("galleryGrid");
  if(!grid)return;
  if(!cloud){
    grid.innerHTML='<div class="gallery-empty">Gallery is temporarily unavailable. Please visit again soon.</div>';
    return;
  }
  try{
    const {data,error}=await cloud.from("gallery_media")
      .select("file_path,file_name,mime_type,created_at,vehicle_category,vehicle_name,photo_type,title")
      .order("created_at",{ascending:false});
    if(error)throw error;
    publicGalleryItems=data||[];
    renderPublicGallery();
  }catch(error){
    console.error("Public gallery could not be loaded:",error);
    grid.innerHTML='<div class="gallery-empty">We could not load the gallery right now. Please try again later.</div>';
  }
}
const galleryFilters=$("publicGalleryFilters");
if(galleryFilters){
  galleryFilters.addEventListener("click",event=>{
    const button=event.target.closest("button[data-category]");
    if(!button)return;
    activeGalleryCategory=button.dataset.category;
    galleryFilters.querySelectorAll(".gallery-filter").forEach(item=>{
      const active=item===button;
      item.classList.toggle("active",active);
      item.setAttribute("aria-pressed",String(active));
    });
    renderPublicGallery();
  });
}
loadPublicGallery();

$("contactForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const name=$("enqName").value,phone=$("enqPhone").value,message=$("enqMessage").value;
  if(cloud){
    const {error}=await cloud.from("enquiries").insert({name,phone,message});
    if(error)console.warn("Enquiry cloud save failed:",error.message);
  }
  const subject=encodeURIComponent("Travel enquiry from "+name);
  const body=encodeURIComponent("Name: "+name+"\\nPhone: "+phone+"\\n\\nRequirement:\\n"+message);
  window.location.href=`mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
});
