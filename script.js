// Business contact details
const BUSINESS_EMAIL = "sachinenterprises1012@gmail.com";
const $ = (id) => document.getElementById(id);
const today = new Date().toISOString().slice(0,10);
$("docDate").value = today;
$("year").textContent = new Date().getFullYear();
$("menuToggle").addEventListener("click", () => $("nav").classList.toggle("open"));
document.querySelectorAll("#nav a").forEach(a => a.addEventListener("click", () => $("nav").classList.remove("open")));

const cloudReady = window.SUPABASE_URL && window.SUPABASE_ANON_KEY &&
  window.SUPABASE_URL.startsWith("https://") && !window.SUPABASE_URL.includes("PASTE_") &&
  !window.SUPABASE_ANON_KEY.includes("PASTE_");
const cloud = cloudReady ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;

function money(n){ return "₹" + Number(n || 0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2}); }
function addLine(desc="", qty=1, rate=0){
  const row=document.createElement("div"); row.className="item-row";
  row.innerHTML=`<input class="desc" aria-label="Description" placeholder="Charge description"><input class="qty" aria-label="Quantity" type="number" min="0" value="1"><input class="rate" aria-label="Rate" type="number" min="0" value="0"><span class="line-total">₹0.00</span><button class="remove" type="button" title="Remove item">×</button>`;
  row.querySelector(".desc").value=desc; row.querySelector(".qty").value=qty; row.querySelector(".rate").value=rate;
  row.querySelectorAll("input").forEach(i=>i.addEventListener("input",updatePreview));
  row.querySelector(".remove").addEventListener("click",()=>{row.remove();updatePreview();});
  $("items").appendChild(row); updatePreview();
}
$("addLine").addEventListener("click",()=>addLine());
["docType","docNo","docDate","customer","customerPhone","customerAddress","pickup","destination","journeyDate","vehicle","notes","gst"].forEach(id=>$(id).addEventListener("input",updatePreview));
$("generate").addEventListener("click",updatePreview);

function updatePreview(){
  const type=$("docType").value, rows=[...document.querySelectorAll(".item-row")];
  $("pType").textContent=type.toUpperCase(); $("pNo").textContent=$("docNo").value||"—"; $("pDate").textContent=$("docDate").value||"";
  $("pCustomer").textContent=$("customer").value||"Customer name"; $("pCustomerPhone").textContent=$("customerPhone").value; $("pCustomerAddress").textContent=$("customerAddress").value;
  $("pPickup").textContent=$("pickup").value||"—"; $("pDestination").textContent=$("destination").value||"—";
  $("pJourney").textContent=$("journeyDate").value||"—"; $("pVehicle").textContent=$("vehicle").value||"—";
  $("pNotes").textContent=$("notes").value||"Thank you for choosing Sachin Enterprises.";
  let subtotal=0; $("pItems").innerHTML="";
  rows.forEach(row=>{
    const desc=row.querySelector(".desc").value||"Service";
    const qty=Number(row.querySelector(".qty").value)||0, rate=Number(row.querySelector(".rate").value)||0, amount=qty*rate;
    subtotal+=amount; row.querySelector(".line-total").textContent=money(amount);
    const tr=document.createElement("tr");
    [desc,qty,money(rate),money(amount)].forEach(v=>{const td=document.createElement("td");td.textContent=v;tr.appendChild(td);});
    $("pItems").appendChild(tr);
  });
  const gst=subtotal*(Number($("gst").value)||0)/100;
  $("pSubtotal").textContent=money(subtotal); $("pGst").textContent=money(gst); $("pTotal").textContent=money(subtotal+gst);
}
$("printBtn").addEventListener("click",()=>{updatePreview();window.print();});
$("saveDocBtn").addEventListener("click",async()=>{
  if(!cloud){alert("Online saving is not configured yet. Complete Supabase setup first.");return;}
  updatePreview();
  const rows=[...document.querySelectorAll(".item-row")].map(r=>({description:r.querySelector(".desc").value,quantity:Number(r.querySelector(".qty").value)||0,rate:Number(r.querySelector(".rate").value)||0}));
  const total=rows.reduce((s,x)=>s+x.quantity*x.rate,0)*(1+(Number($("gst").value)||0)/100);
  const {error}=await cloud.from("documents").insert({doc_type:$("docType").value,doc_number:$("docNo").value,customer_name:$("customer").value,customer_phone:$("customerPhone").value,trip_from:$("pickup").value,trip_to:$("destination").value,items:rows,total_amount:total});
  if(error) alert("Could not save document: "+error.message); else alert("Document saved to your admin panel.");
});

async function loadPublicGallery(){
  if(!cloud) return;
  const {data,error}=await cloud.from("gallery_media").select("*").order("created_at",{ascending:false});
  if(error || !data || !data.length) return;
  const grid=$("galleryGrid"); grid.innerHTML="";
  data.forEach(item=>{
    const {data:urlData}=cloud.storage.from("gallery").getPublicUrl(item.file_path);
    const card=document.createElement("div"); card.className="gallery-placeholder"; card.style.padding="8px";
    const media=document.createElement(item.mime_type.startsWith("video/")?"video":"img");
    media.src=urlData.publicUrl; media.style.width="100%";media.style.height="180px";media.style.objectFit="cover";media.style.borderRadius="8px";
    if(media.tagName==="VIDEO")media.controls=true;
    const caption=document.createElement("small");caption.textContent=item.file_name;
    card.append(media,caption);grid.appendChild(card);
  });
}
loadPublicGallery();

$("contactForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const name=$("enqName").value, phone=$("enqPhone").value, message=$("enqMessage").value;
  if(cloud){
    const {error}=await cloud.from("enquiries").insert({name,phone,message});
    if(error) console.warn("Enquiry cloud save failed:",error.message);
  }
  const subject=encodeURIComponent("Travel enquiry from "+name);
  const body=encodeURIComponent("Name: "+name+"\nPhone: "+phone+"\n\nRequirement:\n"+message);
  window.location.href=`mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
});
updatePreview();
