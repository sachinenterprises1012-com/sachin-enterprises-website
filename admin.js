const ready=window.SUPABASE_URL&&window.SUPABASE_ANON_KEY&&window.SUPABASE_URL.startsWith("https://")&&!window.SUPABASE_URL.includes("PASTE_")&&!window.SUPABASE_ANON_KEY.includes("PASTE_");
const client=ready?window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY):null;const el=id=>document.getElementById(id);const ADMIN_EMAIL="sachinenterprises1012@gmail.com";let docs=[];
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});const dateNow=()=>new Date().toISOString().slice(0,10);const setStatus=(id,msg)=>{if(el(id))el(id).textContent=msg;};
if(!ready){el("setupNotice").classList.remove("hidden");setStatus("loginStatus","Check the Supabase Project URL and publishable key in config.js.");}
else checkSession();
el("loginBtn").addEventListener("click",async()=>{if(!client)return;setStatus("loginStatus","Signing in...");const {data,error}=await client.auth.signInWithPassword({email:el("loginEmail").value,password:el("loginPassword").value});if(error)setStatus("loginStatus",error.message);else showDashboard(data.session);});
async function checkSession(){const {data}=await client.auth.getSession();if(data.session)showDashboard(data.session);}
function showDashboard(session){if(session.user.email!==ADMIN_EMAIL){setStatus("loginStatus","This account is not authorised as the business admin.");client.auth.signOut();return;}el("loginCard").classList.add("hidden");el("setupNotice").classList.add("hidden");el("dashboard").classList.remove("hidden");el("logout").classList.remove("hidden");loadAll();}
el("logout").addEventListener("click",async()=>{await client.auth.signOut();location.reload();});
document.querySelectorAll("[data-panel]").forEach(b=>b.addEventListener("click",()=>showPanel(b.dataset.panel,b)));document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showPanel(b.dataset.go,document.querySelector(`[data-panel='${b.dataset.go}']`))));
function showPanel(id,btn){document.querySelectorAll(".panel").forEach(x=>x.classList.add("hidden"));el(id).classList.remove("hidden");document.querySelectorAll("[data-panel]").forEach(x=>x.classList.toggle("active",x.dataset.panel===id));if(id==="quotations"||id==="invoices"||id==="customers")loadDocuments();}
function addItem(desc="Vehicle rental",qty=1,rate=0){const tr=document.createElement("tr");tr.innerHTML=`<td><input class="li-desc desc" placeholder="Description"></td><td><input class="li-qty qty" type="number" min="0" step="0.01" value="${qty}"></td><td><input class="li-rate rate" type="number" min="0" step="0.01" value="${rate}"></td><td class="li-amount">₹0.00</td><td><button type="button" aria-label="Remove item">×</button></td>`;tr.querySelector(".desc").value=desc;tr.querySelectorAll("input").forEach(x=>x.addEventListener("input",updateBill));tr.querySelector("button").addEventListener("click",()=>{tr.remove();updateBill();});el("billItems").appendChild(tr);updateBill();}
function getBill(){const items=[...el("billItems").querySelectorAll("tr")].map(r=>({description:r.querySelector(".desc").value||"Service",quantity:Number(r.querySelector(".qty").value)||0,rate:Number(r.querySelector(".rate").value)||0}));const subtotal=items.reduce((s,x)=>s+x.quantity*x.rate,0);const discount=Math.max(0,Number(el("bDiscount").value)||0);const taxable=Math.max(0,subtotal-discount);const gstRate=Math.max(0,Number(el("bGst").value)||0);const gstAmount=taxable*gstRate/100;const total=taxable+gstAmount;const advance=Math.max(0,Number(el("bAdvance").value)||0);return {items,subtotal,discount,gstRate,gstAmount,total,advance,balance:Math.max(0,total-advance)};}
function updateBill(){if(!el("billItems"))return;const x=getBill();[...el("billItems").querySelectorAll("tr")].forEach((r,i)=>r.querySelector(".li-amount").textContent=money(x.items[i].quantity*x.items[i].rate));el("bSubtotal").textContent=money(x.subtotal);el("bDiscountView").textContent=money(x.discount);el("bGstView").textContent=money(x.gstAmount);el("bTotal").textContent=money(x.total);el("bAdvanceView").textContent=money(x.advance);el("bBalance").textContent=money(x.balance);renderPreview(x);}
function renderPreview(x=getBill()){el("pvType").textContent=el("bType").value.toUpperCase();el("pvNumber").textContent=el("bNumber").value||"Draft";el("pvDate").textContent="Date: "+(el("bDate").value||dateNow())+(el("bDue").value?" · Due: "+el("bDue").value:"");el("pvCustomer").textContent=el("bCustomer").value||"Customer name";el("pvPhone").textContent=el("bPhone").value;el("pvAddress").textContent=el("bAddress").value;el("pvFrom").textContent=el("bFrom").value||"—";el("pvTo").textContent=el("bTo").value||"—";el("pvJourney").textContent=el("bJourney").value||"—";el("pvVehicle").textContent=el("bVehicle").value||"—";el("pvItems").innerHTML="";x.items.forEach(it=>{const tr=document.createElement("tr");[it.description,it.quantity,money(it.rate),money(it.quantity*it.rate)].forEach(v=>{const td=document.createElement("td");td.textContent=v;tr.appendChild(td);});el("pvItems").appendChild(tr);});el("pvSubtotal").textContent=money(x.subtotal);el("pvDiscount").textContent=money(x.discount);el("pvGst").textContent=money(x.gstAmount);el("pvTotal").textContent=money(x.total);el("pvAdvance").textContent=money(x.advance);el("pvBalance").textContent=money(x.balance);el("pvNotes").textContent=el("bNotes").value||"Thank you for choosing Sachin Enterprises.";}
el("addBillItem").addEventListener("click",()=>addItem("",1,0));["bType","bNumber","bDate","bDue","bCustomer","bPhone","bAddress","bFrom","bTo","bJourney","bVehicle","bDiscount","bGst","bAdvance","bPayment","bNotes"].forEach(id=>el(id).addEventListener("input",updateBill));el("bType").addEventListener("change",()=>{if(el("bType").value==="quotation")el("bPayment").value="not_applicable";updateBill();});
el("previewBill").addEventListener("click",updateBill);el("printBill").addEventListener("click",()=>{updateBill();window.print();});el("newBill").addEventListener("click",resetBill);
function resetBill(){["bNumber","bCustomer","bPhone","bAddress","bFrom","bTo","bJourney","bVehicle","bNotes"].forEach(id=>el(id).value="");el("bType").value="invoice";el("bDate").value=dateNow();el("bDue").value="";el("bDiscount").value=0;el("bGst").value=0;el("bAdvance").value=0;el("bPayment").value="unpaid";el("billItems").innerHTML="";addItem("Vehicle rental",1,0);setStatus("billStatus","");updateBill();}
el("saveBill").addEventListener("click",async()=>{if(!client)return;const x=getBill();if(!el("bCustomer").value.trim()){setStatus("billStatus","Enter the customer name before saving.");return;}if(!x.items.length||x.items.every(i=>!i.description.trim())){setStatus("billStatus","Add at least one item.");return;}const type=el("bType").value;const number=el("bNumber").value.trim()||((type==="invoice"?"SE-INV-":"SE-QTN-")+Date.now().toString().slice(-8));const payload={doc_type:type,doc_number:number,document_date:el("bDate").value||dateNow(),due_date:el("bDue").value||null,customer_name:el("bCustomer").value.trim(),customer_phone:el("bPhone").value,customer_address:el("bAddress").value,trip_from:el("bFrom").value,trip_to:el("bTo").value,journey_date:el("bJourney").value||null,vehicle:el("bVehicle").value,items:x.items,subtotal:x.subtotal,discount_amount:x.discount,gst_rate:x.gstRate,gst_amount:x.gstAmount,total_amount:x.total,advance_amount:x.advance,balance_amount:x.balance,payment_status:type==="quotation"?"not_applicable":el("bPayment").value,notes:el("bNotes").value};setStatus("billStatus","Saving document...");const {error}=await client.from("documents").insert(payload);if(error){setStatus("billStatus","Save failed: "+error.message+". Check the Billing database update in Supabase SQL Editor.");return;}el("bNumber").value=number;setStatus("billStatus",type+" "+number+" saved successfully.");loadDocuments();});
async function loadBusinessSignature(){
 const targets=["pvSignature","epSignature"];
 const {data,error}=await client.storage.from("business-private").download("sachin-signature.png");
 if(error){console.warn("Business signature could not be loaded:",error.message);return;}
 const objectUrl=URL.createObjectURL(data);
 targets.forEach(id=>{const img=el(id);if(img){img.onload=()=>img.style.display="block";img.src=objectUrl;}});
}
async function loadAll(){resetBill();resetEvent();await Promise.all([loadMedia(),loadEnquiries(),loadDocuments(),loadBusinessSignature()]);}
async function loadMedia(){const {data,error}=await client.from("gallery_media").select("*").order("created_at",{ascending:false});if(error){el("mediaList").textContent=error.message;return;}el("mediaList").innerHTML="";(data||[]).forEach(item=>{const {data:u}=client.storage.from("gallery").getPublicUrl(item.file_path);const node=document.createElement(item.mime_type.startsWith("video/")?"video":"img");node.src=u.publicUrl;if(node.tagName==="VIDEO")node.controls=true;const wrap=document.createElement("div");wrap.appendChild(node);const label=document.createElement("small");label.textContent=item.file_name;wrap.appendChild(label);const del=document.createElement("button");del.className="admin-btn danger";del.textContent="Delete";del.style.marginTop="6px";del.onclick=async()=>{if(!confirm("Delete this gallery item?"))return;await client.storage.from("gallery").remove([item.file_path]);await client.from("gallery_media").delete().eq("id",item.id);loadMedia();};wrap.appendChild(del);el("mediaList").appendChild(wrap);});}
async function loadEnquiries(){const {data,error}=await client.from("enquiries").select("*").order("created_at",{ascending:false}).limit(100);if(error){el("enquiries").textContent=error.message;return;}el("enquiries").innerHTML="";(data||[]).forEach(x=>{const d=document.createElement("div");d.className="record";d.textContent=`${x.name} · ${x.phone} · ${x.created_at?new Date(x.created_at).toLocaleString():""}`;const m=document.createElement("p");m.textContent=x.message;d.appendChild(m);el("enquiries").appendChild(d);});if(!data?.length)el("enquiries").textContent="No enquiries received yet.";}
async function loadDocuments(){const {data,error}=await client.from("documents").select("*").order("created_at",{ascending:false}).limit(300);if(error){el("quoteList").textContent=error.message;el("invoiceList").textContent=error.message;return;}docs=data||[];const inv=docs.filter(x=>x.doc_type==="invoice"),q=docs.filter(x=>x.doc_type==="quotation");el("statInvoices").textContent=inv.length;el("statQuotes").textContent=q.length;el("statValue").textContent=money(inv.reduce((s,x)=>s+Number(x.total_amount||0),0));renderDocList("quoteList",q);renderDocList("invoiceList",inv);const seen=new Map();docs.forEach(d=>{const key=(d.customer_name||"").toLowerCase();if(key&&!seen.has(key))seen.set(key,d);});el("customerList").innerHTML="";[...seen.values()].forEach(d=>{const row=document.createElement("div");row.className="record";row.textContent=d.customer_name+" · "+(d.customer_phone||"No phone");el("customerList").appendChild(row);});if(!seen.size)el("customerList").textContent="No customers saved yet.";}
function renderDocList(id,items){el(id).innerHTML="";if(!items.length){el(id).textContent="No documents saved yet.";return;}items.forEach(d=>{const row=document.createElement("div");row.className="record";const title=document.createElement("b");title.textContent=(d.doc_number||d.doc_type)+" · "+(d.customer_name||"Customer");const detail=document.createElement("small");detail.textContent=(d.document_date||d.created_at?.slice(0,10)||"")+" · "+money(d.total_amount)+ (d.payment_status?" · "+d.payment_status:"");row.append(title,detail);const actions=document.createElement("div");actions.className="record-actions no-print";const btn=document.createElement("button");btn.className="admin-btn secondary";btn.textContent="Load into billing";btn.onclick=()=>loadIntoBill(d);actions.appendChild(btn);row.appendChild(actions);el(id).appendChild(row);});}
function loadIntoBill(d){showPanel("billing",document.querySelector('[data-panel="billing"]'));el("bType").value=d.doc_type;el("bNumber").value=d.doc_number||"";el("bDate").value=d.document_date||dateNow();el("bDue").value=d.due_date||"";el("bCustomer").value=d.customer_name||"";el("bPhone").value=d.customer_phone||"";el("bAddress").value=d.customer_address||"";el("bFrom").value=d.trip_from||"";el("bTo").value=d.trip_to||"";el("bJourney").value=d.journey_date||"";el("bVehicle").value=d.vehicle||"";el("bDiscount").value=d.discount_amount||0;el("bGst").value=d.gst_rate||0;el("bAdvance").value=d.advance_amount||0;el("bPayment").value=d.payment_status||"unpaid";el("bNotes").value=d.notes||"";el("billItems").innerHTML="";(d.items||[]).forEach(i=>addItem(i.description,i.quantity,i.rate));updateBill();setStatus("billStatus","Loaded saved document. Change its number before saving a new copy.");}
el("uploadBtn").addEventListener("click",async()=>{const files=[...el("mediaFiles").files];if(!files.length){setStatus("uploadStatus","Choose at least one image or video.");return;}setStatus("uploadStatus","Uploading...");for(const file of files){const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]/g,"-");const path=Date.now()+"-"+Math.random().toString(36).slice(2,7)+"-"+safe;const {error}=await client.storage.from("gallery").upload(path,file,{upsert:false,contentType:file.type});if(error){setStatus("uploadStatus","Upload error: "+error.message);return;}const {error:dbError}=await client.from("gallery_media").insert({file_path:path,file_name:file.name,mime_type:file.type});if(dbError){setStatus("uploadStatus","File uploaded but gallery record failed: "+dbError.message);return;}}setStatus("uploadStatus","Upload complete.");el("mediaFiles").value="";loadMedia();});


// Event booking: multiple vehicle lines, independent pricing and optional individual schedules.
let eventVehicleCounter=0;
function addEventVehicle(seed={}){
 eventVehicleCounter++;
 const id="ev"+eventVehicleCounter;
 const box=document.createElement("div");box.className="event-vehicle";box.dataset.eventVehicle=id;
 box.innerHTML=`<div class="event-vehicle-head"><strong>Vehicle allocation ${eventVehicleCounter}</strong><button type="button" class="remove-event-vehicle">Remove</button></div>
 <div class="bill-grid">
 <label>Vehicle / category<input class="ev-name" placeholder="e.g. 20-Seater AC Tempo Traveller"></label>
 <label>Quantity<input class="ev-qty" type="number" min="1" step="1" value="1"></label>
 <label>Pricing method<select class="ev-method"><option value="fixed">Fixed package</option><option value="per_day">Per day</option><option value="per_day_km">Per day + km limit</option><option value="per_km">Per kilometre</option><option value="custom">Custom amount</option></select></label>
 <label>Rate (₹)<input class="ev-rate" type="number" min="0" step="0.01" value="0"></label>
 <label class="ev-days-wrap">Days<input class="ev-days" type="number" min="0" step="1" value="1"></label>
 <label class="ev-km-wrap">Included / total km<input class="ev-km" type="number" min="0" step="1" value="0"></label>
 <label class="ev-extra-km-wrap">Extra km<input class="ev-extra-km" type="number" min="0" step="1" value="0"></label>
 <label class="ev-extra-rate-wrap">Extra km rate (₹)<input class="ev-extra-rate" type="number" min="0" step="0.01" value="0"></label>
 <label>Toll (₹)<input class="ev-toll" type="number" min="0" step="0.01" value="0"></label>
 <label>Parking (₹)<input class="ev-parking" type="number" min="0" step="0.01" value="0"></label>
 <label>Driver allowance (₹)<input class="ev-allowance" type="number" min="0" step="0.01" value="0"></label>
 <label>Night charges (₹)<input class="ev-night" type="number" min="0" step="0.01" value="0"></label>
 <label>Other vehicle charges (₹)<input class="ev-other" type="number" min="0" step="0.01" value="0"></label>
 <label>Vehicle number (optional)<input class="ev-reg" placeholder="Vehicle registration"></label>
 <label>Destination<input class="ev-destination" placeholder="e.g. Mahabaleshwar / Mumbai"></label>
 <label>RTO permit (₹)<input class="ev-permit" type="number" min="0" step="0.01" value="0"></label>
 </div><div class="status ev-line-total">Line total: ₹0.00</div>`;
 const method=box.querySelector(".ev-method");
 Object.entries(seed).forEach(([k,v])=>{const node=box.querySelector(".ev-"+k);if(node&&v!==undefined)node.value=v;});
 function visibility(){const m=method.value;box.querySelector(".ev-days-wrap").style.display=(m==="per_day"||m==="per_day_km")?"block":"none";box.querySelector(".ev-km-wrap").style.display=(m==="per_day_km"||m==="per_km")?"block":"none";box.querySelector(".ev-extra-km-wrap").style.display=(m==="per_day_km"||m==="per_km")?"block":"none";box.querySelector(".ev-extra-rate-wrap").style.display=(m==="per_day_km"||m==="per_km")?"block":"none";updateEvent();}
 box.querySelectorAll("input,select,textarea").forEach(n=>n.addEventListener("input",updateEvent));
 method.addEventListener("change",visibility);
 box.querySelector(".remove-event-vehicle").addEventListener("click",()=>{box.remove();updateEvent();});
 el("eventVehicles").appendChild(box);visibility();
}
function getEventVehicles(){
 return [...document.querySelectorAll(".event-vehicle")].map(box=>{
  const val=c=>box.querySelector(".ev-"+c)?.value||"";
  const qty=Math.max(0,Number(val("qty"))||0),rate=Math.max(0,Number(val("rate"))||0),days=Math.max(0,Number(val("days"))||0),km=Math.max(0,Number(val("km"))||0),extraKm=Math.max(0,Number(val("extra-km"))||0),extraRate=Math.max(0,Number(val("extra-rate"))||0),method=val("method"),toll=Math.max(0,Number(val("toll"))||0),parking=Math.max(0,Number(val("parking"))||0),allowance=Math.max(0,Number(val("allowance"))||0),night=Math.max(0,Number(val("night"))||0),otherCharges=Math.max(0,Number(val("other"))||0);
  let unit=rate;
  if(method==="per_day"||method==="per_day_km")unit=rate*days;
  if(method==="per_km")unit=rate*km;
  const base=unit*qty,extraKmCharge=(method==="per_day_km"||method==="per_km")?extraKm*extraRate*qty:0,charges={toll,parking,driver_allowance:allowance,night_charges:night,rto_permit:Math.max(0,Number(val("permit"))||0),other:otherCharges};const chargeTotal=Object.values(charges).reduce((a,b)=>a+b,0);return {vehicle:val("name"),quantity:qty,pricing_method:method,rate,days,included_or_total_km:km,extra_km:extraKm,extra_km_rate:extraRate,extra_km_charge:extraKmCharge,vehicle_number:val("reg"),destination:val("destination"),vehicle_charges:charges,base_amount:base,line_total:base+extraKmCharge+chargeTotal};
 }).filter(x=>x.vehicle||x.line_total>0);
}
function getEventTotals(){
 const vehicles=getEventVehicles(),vehicleTotal=vehicles.reduce((s,v)=>s+v.line_total,0),other=Math.max(0,Number(el("eOther").value)||0),discount=Math.max(0,Number(el("eDiscount").value)||0),taxable=Math.max(0,vehicleTotal+other-discount),gstRate=Math.max(0,Number(el("eGst").value)||0),gst=taxable*gstRate/100,total=taxable+gst,advance=Math.max(0,Number(el("eAdvance").value)||0);
 return {vehicles,vehicleTotal,other,discount,gstRate,gst,total,advance,balance:Math.max(0,total-advance)};
}
function updateEvent(){
 if(!el("eventVehicles"))return;
 const x=getEventTotals();
 document.querySelectorAll(".event-vehicle").forEach((box,i)=>{const v=x.vehicles[i];if(v)box.querySelector(".ev-line-total").textContent="Line total: "+money(v.line_total);});
 [["eVehicleTotal",x.vehicleTotal],["eOtherView",x.other],["eDiscountView",x.discount],["eGstView",x.gst],["eGrandTotal",x.total],["eAdvanceView",x.advance],["eBalance",x.balance]].forEach(([id,n])=>el(id).textContent=money(n));
 renderEventPreview(x);
}
function renderEventPreview(x=getEventTotals()){
 const value=id=>el(id).value||"";
 el("epType").textContent=value("eDocType").toUpperCase();
 el("epName").textContent=value("eName")||"Event / booking";
 el("epNumber").textContent="Draft";
 el("epCustomer").textContent=(value("eCustomer")||"Customer")+" · "+value("ePhone");
 el("epDates").textContent="Dates: "+(value("eStart")||"—")+" to "+(value("eEnd")||"—");
 el("epCommon").textContent="Common pickup: "+(value("ePickup")||"—")+" · Drop: "+(value("eDrop")||"—");
 el("epVehicleRows").innerHTML="";
 x.vehicles.forEach(v=>{const wrap=document.createElement("div");wrap.className="event-preview-vehicle";const h=document.createElement("strong");h.textContent=v.vehicle+" × "+v.quantity;const p=document.createElement("p");p.className="muted";p.textContent="Vehicle No.: "+(v.vehicle_number||"Not assigned")+" · Destination: "+(v.destination||"—")+" · Pricing: "+v.pricing_method.replaceAll("_"," ")+" · Rate: "+money(v.rate);wrap.append(h,p);const chargeRows=[ ["Base vehicle charge",v.base_amount], ["Extra km",v.extra_km_charge], ["Toll",v.vehicle_charges.toll], ["Parking",v.vehicle_charges.parking], ["Driver allowance",v.vehicle_charges.driver_allowance], ["Night charges",v.vehicle_charges.night_charges], ["RTO permit",v.vehicle_charges.rto_permit], ["Other vehicle charges",v.vehicle_charges.other] ].filter(r=>Number(r[1])>0);if(chargeRows.length){const table=document.createElement("table");chargeRows.forEach(r=>{const tr=document.createElement("tr"),a=document.createElement("td"),b=document.createElement("td");a.textContent=r[0];b.textContent=money(r[1]);b.style.textAlign="right";tr.append(a,b);table.appendChild(tr);});wrap.appendChild(table);}const amount=document.createElement("p");amount.style.textAlign="right";amount.innerHTML="<strong>Vehicle total: "+money(v.line_total)+"</strong>";wrap.appendChild(amount);el("epVehicleRows").appendChild(wrap);});
 [["epVehicleTotal",x.vehicleTotal],["epOther",x.other],["epDiscount",x.discount],["epGst",x.gst],["epGrand",x.total],["epAdvance",x.advance],["epBalance",x.balance]].forEach(([id,n])=>el(id).textContent=money(n));
 el("epNotes").textContent=value("eNotes");
}
function resetEvent(){
 if(!el("eventVehicles"))return;
 ["eName","eCustomer","eContact","ePhone","eAddress","eStart","eEnd","ePickup","eDrop","eReport","eDepart","eScheduleNotes","eNotes"].forEach(id=>el(id).value="");
 el("eDocType").value="quotation";el("eTripType").value="Event Transportation";el("eOther").value=0;el("eDiscount").value=0;el("eGst").value=0;el("eAdvance").value=0;el("ePayment").value="not_applicable";el("eventVehicles").innerHTML="";eventVehicleCounter=0;addEventVehicle();setStatus("eventStatus","");updateEvent();
}
el("addEventVehicle").addEventListener("click",()=>addEventVehicle());
["eDocType","eTripType","eName","eCustomer","eContact","ePhone","eAddress","eStart","eEnd","ePickup","eDrop","eReport","eDepart","eScheduleNotes","eOther","eDiscount","eGst","eAdvance","ePayment","eNotes"].forEach(id=>el(id).addEventListener("input",updateEvent));
el("eDocType").addEventListener("change",()=>{el("ePayment").value=el("eDocType").value==="quotation"?"not_applicable":"unpaid";updateEvent();});
el("previewEvent").addEventListener("click",updateEvent);
el("printEvent").addEventListener("click",()=>{updateEvent();const p=el("eventPreview");p.dataset.printing="1";document.body.classList.add("print-event");window.print();document.body.classList.remove("print-event");delete p.dataset.printing;});
el("resetEvent").addEventListener("click",resetEvent);
el("saveEvent").addEventListener("click",async()=>{
 const x=getEventTotals(),customer=el("eCustomer").value.trim();
 if(!customer){setStatus("eventStatus","Enter the customer / company name.");return;}
 if(!x.vehicles.length){setStatus("eventStatus","Add at least one vehicle.");return;}
 const type=el("eDocType").value,number=(type==="invoice"?"SE-INV-":"SE-QTN-")+Date.now().toString().slice(-8);
 const items=x.vehicles.map(v=>({description:v.vehicle+" × "+v.quantity+" ("+v.pricing_method+")",quantity:v.quantity,rate:v.line_total/Math.max(1,v.quantity)}));
 if(x.other>0)items.push({description:"Event-level toll / parking / other",quantity:1,rate:x.other});
 const payload={doc_type:type,doc_number:number,document_date:dateNow(),customer_name:customer,customer_phone:el("ePhone").value,customer_address:el("eAddress").value,trip_from:el("ePickup").value,trip_to:el("eDrop").value,journey_date:el("eStart").value||null,vehicle:"Multiple vehicles",items,subtotal:x.vehicleTotal+x.other,discount_amount:x.discount,gst_rate:x.gstRate,gst_amount:x.gst,total_amount:x.total,advance_amount:x.advance,balance_amount:x.balance,payment_status:type==="quotation"?"not_applicable":el("ePayment").value,notes:el("eNotes").value,booking_type:el("eTripType").value,event_name:el("eName").value,event_contact_person:el("eContact").value,event_start_date:el("eStart").value||null,event_end_date:el("eEnd").value||null,common_schedule:{pickup:el("ePickup").value,drop:el("eDrop").value},vehicle_allocations:x.vehicles};
 setStatus("eventStatus","Saving event document...");
 const {error}=await client.from("documents").insert(payload);
 if(error){setStatus("eventStatus","Save failed: "+error.message+". Run the event billing SQL migration first.");return;}
 el("epNumber").textContent=number;setStatus("eventStatus",type+" "+number+" saved successfully.");loadDocuments();
});
