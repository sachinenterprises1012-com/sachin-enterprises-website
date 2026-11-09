const BUSINESS_EMAIL = "sachinenterprises1012@gmail.com";
const $ = (id) => document.getElementById(id);

const ready = Boolean(
  window.SUPABASE_URL &&
  window.SUPABASE_ANON_KEY &&
  window.SUPABASE_URL.startsWith("https://") &&
  !window.SUPABASE_URL.includes("PASTE_") &&
  !window.SUPABASE_ANON_KEY.includes("PASTE_")
);
const cloud = ready && window.supabase
  ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
  : null;

const yearElement = $("year");
if (yearElement) yearElement.textContent = new Date().getFullYear();
const menuToggle = $("menuToggle");
const nav = $("nav");
if (menuToggle && nav) menuToggle.addEventListener("click", () => nav.classList.toggle("open"));
document.querySelectorAll("#nav a").forEach((a) =>
  a.addEventListener("click", () => nav && nav.classList.remove("open"))
);

let publicGalleryItems = [];
let activeGalleryCategory = "All";

function normalizeCategory(value) {
  const valueClean = String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (["car", "cars", "car & suv", "cars & suvs"].includes(valueClean)) return "Cars";
  if (["tempo", "tempo traveller", "tempo travellers", "tempo traveller & urbania", "tempo & urbania", "urbania"].includes(valueClean)) return "Tempo Traveller & Urbania";
  if (["bus", "buses", "bus & coaches"].includes(valueClean)) return "Buses";
  if (["volvo", "sleeper volvo", "volvo bus"].includes(valueClean)) return "Volvo";
  return valueClean ? String(value).trim() : "Other";
}

function getVisibleGalleryItems() {
  const sorted = [...publicGalleryItems].sort((a, b) =>
    new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );

  // All vehicles: show only the newest photo/video from each vehicle category.
  if (activeGalleryCategory === "All") {
    const seen = new Set();
    return sorted.filter((item) => {
      const category = normalizeCategory(item.vehicle_category);
      if (seen.has(category)) return false;
      seen.add(category);
      return true;
    });
  }

  // A selected category: show every upload belonging to that category.
  return sorted.filter((item) =>
    normalizeCategory(item.vehicle_category) === normalizeCategory(activeGalleryCategory)
  );
}

function renderPublicGallery() {
  const grid = $("galleryGrid");
  if (!grid) return;
  grid.classList.add("public-gallery-grid");
  grid.replaceChildren();

  const visibleItems = getVisibleGalleryItems();
  if (!visibleItems.length) {
    const empty = document.createElement("div");
    empty.className = "gallery-empty";
    empty.textContent = publicGalleryItems.length
      ? "No photos are available in this category yet."
      : "Vehicle photos will appear here soon.";
    grid.appendChild(empty);
    return;
  }

  visibleItems.forEach((item) => {
    const { data: storageData } = cloud.storage.from("gallery").getPublicUrl(item.file_path);
    const card = document.createElement("article");
    card.className = "public-gallery-card";

    const isVideo = String(item.mime_type || "").startsWith("video/");
    const media = document.createElement(isVideo ? "video" : "img");
    media.className = "gallery-media";
    media.src = storageData.publicUrl;
    if (isVideo) {
      media.controls = true;
      media.preload = "metadata";
    } else {
      media.alt = item.title || item.vehicle_name || item.file_name || "Sachin Enterprises vehicle";
      media.loading = "lazy";
    }

    const copy = document.createElement("div");
    copy.className = "gallery-card-copy";
    const title = document.createElement("strong");
    title.className = "gallery-card-title";
    title.textContent = item.title || item.vehicle_name || item.file_name || "Vehicle photo";

    const meta = document.createElement("div");
    meta.className = "gallery-card-meta";
    [item.vehicle_category, item.vehicle_name, item.photo_type].filter(Boolean).forEach((value) => {
      const tag = document.createElement("span");
      tag.className = "gallery-tag";
      tag.textContent = value;
      meta.appendChild(tag);
    });
    copy.append(title, meta);
    card.append(media, copy);
    grid.appendChild(card);
  });
}

async function loadPublicGallery() {
  const grid = $("galleryGrid");
  if (!grid) return;
  if (!cloud) {
    grid.textContent = "Gallery is temporarily unavailable. Please visit again soon.";
    return;
  }
  try {
    const { data, error } = await cloud
      .from("gallery_media")
      .select("file_path,file_name,mime_type,created_at,vehicle_category,vehicle_name,photo_type,title")
      .order("created_at", { ascending: false });
    if (error) throw error;
    publicGalleryItems = data || [];
    renderPublicGallery();
  } catch (error) {
    console.error("Public gallery could not be loaded:", error);
    grid.textContent = "We could not load the gallery right now. Please try again later.";
  }
}

const galleryFilters = $("publicGalleryFilters");
if (galleryFilters) {
  galleryFilters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button || !galleryFilters.contains(button)) return;
    activeGalleryCategory = button.dataset.category || "All";
    galleryFilters.querySelectorAll(".gallery-filter").forEach((filterButton) => {
      const active = filterButton === button;
      filterButton.classList.toggle("active", active);
      filterButton.setAttribute("aria-pressed", String(active));
    });
    renderPublicGallery();
  });
}
loadPublicGallery();

const contactForm = $("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = $("enqName").value;
    const phone = $("enqPhone").value;
    const message = $("enqMessage").value;
    if (cloud) {
      const { error } = await cloud.from("enquiries").insert({ name, phone, message });
      if (error) console.warn("Enquiry cloud save failed:", error.message);
    }
    const subject = encodeURIComponent("Travel enquiry from " + name);
    const body = encodeURIComponent(`Name: ${name}\nPhone: ${phone}\n\nRequirement:\n${message}`);
    window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
  });
}
