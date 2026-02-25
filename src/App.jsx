import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase.js";

// ── Shared palette (Snowbound SW7004) ─────────────────────────────────────────
const C = {
  bg:"#F2EFE8", bgAlt:"#EDE9E1", bgCard:"#F8F6F2", bgCardHov:"#F0EDE5",
  bgHeader:"#E8E4DC", bgHeaderWk:"#EAE6DE", bgWeekend:"#EEEBE3",
  border:"#DDD8CF", borderLight:"#E7E3DB",
  text:"#2A2520", textMid:"#6A6358", textMuted:"#9A9388", textLight:"#C0BBB3",
  appBar:"#1E1C1A", appBarBtn:"#2E2B27",
  accent:"#5C4F3D", accentSoft:"#8B7B66",
  purchased:"#4A8C5C", purchasedBg:"#E6F2EB",
  mixBtn:"#4A3F6B", mixFlash:"#6C5CE7",
  danger:"#B03A2E",
  tabBar:"#1E1C1A", tabActive:"#F0EDE6", tabInactive:"#6A6358",
};

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAY_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const CAT = { top:"Top", bottom:"Bottom", layer:"Layer", shoes:"Shoes", bag:"Handbag" };
const CAT_DOT = { top:"#4B73D9", bottom:"#3A9E6A", layer:"#D97A1A", shoes:"#9E3AB5", bag:"#B03A2E" };

// ── SHARED STORAGE KEYS (same on desktop + mobile) ───────────────────────────
const STORAGE_PIECES  = "wp7-pieces";
const STORAGE_PLAN    = "wp7-plan";
const STORAGE_BRANDS  = "wp7-brands";

const SEED_PIECES = [
  { id:"p1",  name:"Kurt Straight Jeans",             brand:"Sézane",         variant:"Faded Denim",  price:145, link:"https://www.sezane.com/us/product/kurt-straight-jeans/faded-denim",               image:"https://i.pinimg.com/736x/a4/e6/98/a4e698dcb90f94d5be34723b1a527ffb.jpg", category:"bottom", purchased:false },
  { id:"p2",  name:"Effortless Pant",                  brand:"Aritzia",        variant:"Black Linen",   price:148, link:"https://www.aritzia.com/us/en/product/the-effortless-pant%E2%84%A2-linen/118264.html", image:"https://i.pinimg.com/736x/fc/58/08/fc580830165c449cf46f0fd02d7a03ad.jpg", category:"bottom", purchased:false },
  { id:"p3",  name:"Effortless Pant",                  brand:"Aritzia",        variant:"Ivory Linen",   price:148, link:"https://www.aritzia.com/us/en/product/the-effortless-pant%E2%84%A2-linen/118264.html", image:"", category:"bottom", purchased:false },
  { id:"p4",  name:"Stretch Twill Wide Leg",           brand:"Spanx",          variant:"Cypress",       price:148, link:"https://www.spanx.com/collections/pants",                                           image:"https://i.pinimg.com/736x/65/df/56/65df56da997a2178e734d4806190397e.jpg", category:"bottom", purchased:false },
  { id:"p5",  name:"Allegra Sleeveless Blouse",        brand:"Modern Citizen", variant:"Ivory",         price:128, link:"https://www.moderncitizen.com/products/allegra-gathered-neck-sleeveless-blouse-ivory", image:"https://i.pinimg.com/736x/94/69/83/946983d485e499ed1c09ee86659b5085.jpg", category:"top", purchased:false },
  { id:"p6",  name:"Hira Tie-Front Blouse",            brand:"Modern Citizen", variant:"Black",         price:118, link:"https://www.moderncitizen.com/collections/blouses",                                 image:"https://i.pinimg.com/736x/6c/88/b8/6c88b849b6085632914a66bad63b29e9.jpg", category:"top", purchased:false },
  { id:"p7",  name:"Faria Shirt",                      brand:"Sézane",         variant:"Ecru",          price:150, link:"https://www.sezane.com/us-en/product/faria-shirt/ecru",                              image:"https://i.pinimg.com/736x/20/a7/04/20a704681fece72f4063c36d8f72aa33.jpg", category:"top", purchased:false },
  { id:"p8",  name:"Analyne Shirt",                    brand:"Sézane",         variant:"Garden Green",  price:145, link:"https://www.sezane.com/us/collection/Tops",                                          image:"", category:"top", purchased:false },
  { id:"p9",  name:"Carson Cardigan",                  brand:"Modern Citizen", variant:"Cobalt Blue",   price:150, link:"https://www.moderncitizen.com/collections/sweaters",                                image:"", category:"top", purchased:false },
  { id:"p10", name:"Linen-Blend Shrunken Blazer",      brand:"Vince",          variant:"Off-White",     price:568, link:"https://www.vince.com/collections/womens-jackets-blazers",                          image:"https://cdna.lystit.com/300/375/n/photos/nordstrom/4bc1f255/vince-Ecru-Soft-Sculpture-Blazer.jpeg", category:"layer", purchased:false },
  { id:"p11", name:"Double-Breasted Boyfriend Blazer", brand:"Vince",          variant:"Black",         price:595, link:"https://www.vince.com/collections/womens-jackets-blazers",                          image:"", category:"layer", purchased:false },
  { id:"p12", name:"Emerson Structured Jacket",        brand:"Modern Citizen", variant:"",              price:298, link:"https://www.moderncitizen.com/collections/jackets",                                 image:"", category:"layer", purchased:false },
  { id:"p13", name:"Larose Heeled Loafer",             brand:"Vince",          variant:"Black",         price:385, link:"https://www.vince.com/collections/womens-shoes",                                    image:"", category:"shoes", purchased:false },
  { id:"p14", name:"Naomi Leather Loafer",             brand:"Vince",          variant:"Black",         price:350, link:"https://www.vince.com/product/naomi-leather-loafer-298661.html",                   image:"", category:"shoes", purchased:false },
  { id:"p15", name:"Siena Lug-Sole Loafer",            brand:"Vince",          variant:"Black Patent",  price:350, link:"https://www.vince.com/collections/womens-shoes",                                    image:"https://cdna.lystit.com/520/650/n/photos/nordstrom/95dbef18/vince-Black-Patent-Siena-Lugged-Penny-Loafer.jpeg", category:"shoes", purchased:false },
];

const SEED_PLAN = {
  Monday:["p3","p10","p5","p13"], Tuesday:["p1","p8","p11","p15"],
  Wednesday:["p2","p11","p7","p13"], Thursday:["p4","p10","p6","p14"],
  Friday:["p1","p9","p12","p15"], Saturday:[], Sunday:[],
};

const EMPTY_FORM = { name:"", brand:"", variant:"", price:"", link:"", image:"", category:"top", purchased:false };

// ── Hooks ─────────────────────────────────────────────────────────────────────

// Syncs to Supabase when logged in, falls back to localStorage when not.
// localStorage acts as an instant local cache — no loading flicker.
function useStore(key, seed, userId) {
  const [val, setVal] = useState(() => {
    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : seed;
    } catch { return seed; }
  });
  const [synced, setSynced] = useState(false);

  // On login: pull latest value from Supabase (overrides local cache)
  useEffect(() => {
    if (!userId) { setSynced(false); return; }
    supabase
      .from("wardrobe_data")
      .select("value")
      .eq("user_id", userId)
      .eq("key", key)
      .Single()
      .then(({ data }) => {
        if (data?.value !== undefined) {
          setVal(data.value);
          try { localStorage.setItem(key, JSON.stringify(data.value)); } catch {}
        }
        setSynced(true);
      });
  }, [userId, key]);

  // On change: write to localStorage immediately, then sync to Supabase
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    if (!userId || !synced) return;
    supabase.from("wardrobe_data").upsert(
      { user_id: userId, key, value: val, updated_at: new Date().toISOString() },
      { onConflict: "user_id,key" }
    );
  }, [val, userId, synced, key]);

  return [val, setVal];
}

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

// ── Shared helpers ────────────────────────────────────────────────────────────
// ── Smart outfit generation ──────────────────────────────────────────────────
// Assigns each piece a color family and formality score from its name/variant
function pieceProfile(p) {
  const txt = (p.name + " " + (p.variant||"")).toLowerCase();
  // Color family
  let color = "neutral";
  if (/black|charcoal|dark|noir/.test(txt)) color = "dark";
  else if (/white|ivory|cream|ecru|off.white|snow/.test(txt)) color = "light";
  else if (/blue|cobalt|navy|denim|indigo/.test(txt)) color = "blue";
  else if (/green|sage|olive|garden/.test(txt)) color = "green";
  else if (/red|burgundy|wine|rust/.test(txt)) color = "warm";
  else if (/camel|tan|beige|sand|cypress|faded/.test(txt)) color = "neutral";
  // Formality: 0=casual, 1=smart-casual, 2=formal
  let formality = 1;
  if (/jeans|denim|cardigan|sneaker/.test(txt)) formality = 0;
  if (/blazer|jacket|structured|trouser|wide.leg|loafer|patent/.test(txt)) formality = 2;
  return { ...p, color, formality };
}

// Returns true if two color families work well together
function colorsCompat(a, b) {
  if (a === b) return true; // same family always works
  const neutrals = ["neutral","light","dark"];
  if (neutrals.includes(a) || neutrals.includes(b)) return true; // neutrals go with everything
  return false; // two different colors = clash
}

function generateOutfits(pieces) {
  const profiled = pieces.map(pieceProfile);
  const by = cat => profiled.filter(p => p.category === cat);
  const [bottoms, tops, layers, shoes, bags] = ["bottom","top","layer","shoes","bag"].map(by);
  if (!bottoms.length || !tops.length || !shoes.length) return null;

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  const plan = {};

  // Assign day moods: alternate formal/smart-casual/casual across the week
  const moods = [2, 1, 2, 1, 0, 0, 0]; // Mon=formal, Tue=smart-casual, etc.

  // Track usage counts to ensure variety
  const used = {};
  const useCount = id => used[id] = (used[id]||0) + 1;
  const score = p => (used[p.id]||0); // prefer less-used items

  DAYS.forEach((day, i) => {
    if (i >= 5) { plan[day] = []; return; }
    const mood = moods[i];

    // Pick bottom: prefer matching or higher formality
    const validBottoms = shuffle(bottoms).filter(b => b.formality >= mood - 1);
    const bottom = (validBottoms.sort((a,b) => score(a)-score(b))[0]) || shuffle(bottoms)[0];
    useCount(bottom.id);

    // Pick top: must color-coordinate with bottom
    const validTops = shuffle(tops)
      .filter(t => colorsCompat(t.color, bottom.color))
      .sort((a,b) => score(a)-score(b));
    const top = validTops[0] || shuffle(tops)[0];
    useCount(top.id);

    // Pick shoes: match formality, coordinate color
    const validShoes = shuffle(shoes)
      .filter(s => s.formality >= mood - 1 && colorsCompat(s.color, bottom.color))
      .sort((a,b) => score(a)-score(b));
    const shoe = validShoes[0] || shuffle(shoes)[0];
    useCount(shoe.id);

    const out = [bottom.id, top.id, shoe.id];

    // Layer: add on formal/smart-casual days, must coordinate
    if (layers.length && mood >= 1) {
      const validLayers = shuffle(layers)
        .filter(l => colorsCompat(l.color, bottom.color) || colorsCompat(l.color, top.color))
        .sort((a,b) => score(a)-score(b));
      if (validLayers.length) { out.splice(2, 0, validLayers[0].id); useCount(validLayers[0].id); }
    }

    // Bag: optional on all weekdays
    if (bags.length && Math.random() > 0.3) {
      const validBags = shuffle(bags)
        .filter(b => colorsCompat(b.color, bottom.color))
        .sort((a,b) => score(a)-score(b));
      if (validBags.length) { out.push(validBags[0].id); useCount(validBags[0].id); }
    }

    plan[day] = [...new Set(out)];
  });
  return plan;
}

function Thumb({ src, name, category, size=52, onClickEmpty, style={} }) {
  const [err, setErr] = useState(false);
  useEffect(()=>setErr(false),[src]);
  if (!src || err) return (
    <div onClick={onClickEmpty} style={{ width:size, height:size, background:C.bg, border:`1.5px dashed ${C.border}`, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, cursor:onClickEmpty?"pointer":"default", ...style }}>
      {onClickEmpty ? <span style={{ fontSize:9, color:C.textLight, textAlign:"center", lineHeight:1.3, userSelect:"none" }}>+img</span>
        : <span style={{ width:8, height:8, borderRadius:"50%", background:CAT_DOT[category]||C.border, display:"block" }}/>}
    </div>
  );
  return <img src={src} alt={name} width={size} height={size} onError={()=>setErr(true)} style={{ objectFit:"cover", borderRadius:6, flexShrink:0, display:"block", ...style }}/>;
}

function Checkbox({ checked, onChange, small }) {
  const s = small ? 16 : 20;
  return (
    <div onClick={onChange} style={{ width:s, height:s, borderRadius:small?3:5, border:`2px solid ${checked?C.purchased:C.border}`, background:checked?C.purchased:C.bgCard, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, cursor:"pointer", transition:"all .15s" }}>
      {checked && <svg width={small?8:11} height={small?6:9} viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
  );
}

function MiniBtn({ onClick, bg, c, children }) {
  return <button onClick={onClick} style={{ fontSize:10, fontWeight:600, padding:"3px 8px", borderRadius:4, background:bg, border:"none", cursor:"pointer", color:c, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.04em", textTransform:"uppercase" }}>{children}</button>;
}

// ── Brand search URL patterns ────────────────────────────────────────────────
const BRAND_SEARCH_URLS = {
  "Theory":          "https://www.theory.com/search?q={q}",
  "Vince":           "https://www.vince.com/search?q={q}",
  "Sézane":          "https://www.sezane.com/us-en/search?q={q}",
  "Aritzia":         "https://www.aritzia.com/us/en/search?q={q}",
  "Everlane":        "https://www.everlane.com/search?utf8=%E2%9C%93&query={q}",
  "COS":             "https://www.cos.com/en_usd/search.html?q={q}",
  "Toteme":          "https://toteme-studio.com/?s={q}",
  "Massimo Dutti":   "https://www.massimodutti.com/us/search?searchTerm={q}",
  "Madewell":        "https://www.madewell.com/search?Ntt={q}",
  "J.Crew":          "https://www.jcrew.com/search2/index.jsp?q={q}",
  "Banana Republic": "https://bananarepublic.gap.com/browse/search.do?searchText={q}",
  "Reformation":     "https://www.thereformation.com/search?q={q}",
  "& Other Stories": "https://www.stories.com/en_usd/search.html?q={q}",
  "Jenni Kayne":     "https://jennikayne.com/search?q={q}",
  "Equipment":       "https://www.equipmentfr.com/search?q={q}",
  "Rag & Bone":      "https://www.rag-bone.com/search?q={q}",
  "Club Monaco":     "https://www.clubmonaco.com/en/search?q={q}",
  "Veronica Beard":  "https://www.veronicabeard.com/search?q={q}",
  "A.P.C.":          "https://www.apc.fr/en_us/search?q={q}",
  "Celine":          "https://www.celine.com/en-us/search?q={q}",
  "Modern Citizen":  "https://www.moderncitizen.com/search?q={q}",
  "Spanx":           "https://www.spanx.com/search?q={q}",
};

// Default brands shown before user customises
const DEFAULT_BRANDS = ["Theory","Vince","Sézane","Aritzia","Everlane","COS","Toteme","Massimo Dutti","Madewell","Reformation"];

function buildSearchUrl(brand, query) {
  const q = encodeURIComponent(query);
  const pattern = BRAND_SEARCH_URLS[brand];
  if (pattern) return pattern.replace("{q}", q);
  // Fallback: Google site search for unknown brands
  const slug = brand.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
  return `https://www.google.com/search?q=${encodeURIComponent(query + " " + brand)}`;
}

// ── Find New Modal ─────────────────────────────────────────────────────────────
function FindNewModal({ pieces, customBrands, onClose, onAdd, onBrandsChange }) {
  const [tab, setTab]         = useState("search");
  const [query, setQuery]     = useState("");
  const [searched, setSearched] = useState(false);
  const [newBrand, setNewBrand] = useState("");

  // Active brands = custom list if set, else defaults + brands already in library
  const libraryBrands = [...new Set(pieces.map(p => p.brand).filter(Boolean))];
  const activeBrands  = (customBrands && customBrands.length > 0)
    ? customBrands
    : [...new Set([...DEFAULT_BRANDS, ...libraryBrands])];

  const chips = ["silk blouse","tailored trousers","tote bag","cashmere knit","loafers","blazer","wide leg denim","midi skirt","trench coat","ballet flat"];

  const doSearch = (q) => {
    if (!(q||query).trim()) return;
    setQuery(q || query);
    setSearched(true);
  };

  const addBrand = () => {
    const b = newBrand.trim();
    if (!b) return;
    const current = customBrands && customBrands.length > 0 ? customBrands : activeBrands;
    if (current.map(x => x.toLowerCase()).includes(b.toLowerCase())) { setNewBrand(""); return; }
    onBrandsChange([...current, b]);
    setNewBrand("");
  };

  const removeBrand = (b) => {
    const current = customBrands && customBrands.length > 0 ? customBrands : activeBrands;
    onBrandsChange(current.filter(x => x !== b));
  };

  const allKnownBrands = Object.keys(BRAND_SEARCH_URLS).sort();

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(30,28,26,0.55)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:C.bg,borderRadius:"16px 16px 0 0",width:"100%",maxWidth:640,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 -8px 40px rgba(0,0,0,0.2)" }} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding:"18px 20px 0",background:C.bgHeader,flexShrink:0 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
            <div>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:20,color:C.text }}>Find Something New</div>
              <div style={{ fontSize:12,color:C.textMuted,marginTop:1 }}>Visual discovery + live results from your brands</div>
            </div>
            <button onClick={onClose} style={{ background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.textMuted,lineHeight:1,flexShrink:0 }}>×</button>
          </div>
          <div style={{ display:"flex",gap:0,borderBottom:`1px solid ${C.border}` }}>
            {[["search","Search"],["brands",`Brands (${activeBrands.length})`]].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} style={{ padding:"8px 18px",background:"none",border:"none",borderBottom:`2px solid ${tab===id?C.accent:"transparent"}`,cursor:"pointer",fontSize:13,fontWeight:tab===id?600:400,color:tab===id?C.text:C.textMuted,fontFamily:"'DM Sans',sans-serif",marginBottom:-1 }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Search tab ── */}
        {tab==="search" && (
          <>
            <div style={{ padding:"14px 20px 12px",background:C.bgHeader,flexShrink:0 }}>
              <div style={{ display:"flex",gap:8 }}>
                <input value={query} onChange={e=>setQuery(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&doSearch()}
                  placeholder='e.g. "blazer" or "wide leg trousers"'
                  style={{ flex:1,border:`1.5px solid ${C.border}`,borderRadius:8,padding:"9px 12px",fontSize:14,fontFamily:"'DM Sans',sans-serif",color:C.text,outline:"none",background:C.bgCard }} />
                <button onClick={()=>doSearch()} style={{ background:C.appBar,color:"#F0EDE6",border:"none",borderRadius:8,padding:"9px 20px",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>
                  Go
                </button>
              </div>
              <div style={{ display:"flex",gap:5,marginTop:8,flexWrap:"wrap" }}>
                {chips.map(chip=>(
                  <button key={chip} onClick={()=>doSearch(chip)}
                    style={{ fontSize:11,padding:"3px 10px",borderRadius:99,border:`1.5px solid ${C.border}`,background:"transparent",color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ flex:1,overflowY:"auto",padding:"12px 16px 32px" }}>
              {!searched && (
                <div style={{ textAlign:"center",padding:"36px 20px" }}>
                  <div style={{ fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:18,color:C.textMuted,marginBottom:8 }}>Ready to shop</div>
                  <div style={{ fontSize:13,color:C.textLight,lineHeight:1.7 }}>
                    Search for any item — you'll get visual results from Google Shopping and Pinterest, plus direct search links across your {activeBrands.length} brands.
                  </div>
                </div>
              )}

              {searched && (
                <>
                  {/* ── Visual discovery row ── */}
                  <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.textMuted,marginBottom:8 }}>Visual Discovery</div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20 }}>
                    {/* Google Shopping */}
                    <a href={`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer"
                      style={{ display:"flex",flexDirection:"column",background:"#1a73e8",borderRadius:12,padding:"16px 14px",textDecoration:"none",gap:6 }}
                      onMouseEnter={e=>e.currentTarget.style.opacity="0.9"}
                      onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:2 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity=".8"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#fff" opacity=".6"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity=".6"/>
                        </svg>
                        <span style={{ fontSize:12,fontWeight:700,color:"white" }}>Google Shopping</span>
                      </div>
                      <div style={{ fontSize:13,fontWeight:600,color:"white",lineHeight:1.3 }}>"{query}"</div>
                      <div style={{ fontSize:11,color:"rgba(255,255,255,0.75)",lineHeight:1.4 }}>Photos, prices & reviews from every retailer</div>
                      <div style={{ marginTop:4,fontSize:11,fontWeight:700,color:"white" }}>Browse photos ↗</div>
                    </a>

                    {/* Pinterest */}
                    <a href={`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query + " outfit")}`} target="_blank" rel="noreferrer"
                      style={{ display:"flex",flexDirection:"column",background:"#e60023",borderRadius:12,padding:"16px 14px",textDecoration:"none",gap:6 }}
                      onMouseEnter={e=>e.currentTarget.style.opacity="0.9"}
                      onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:2 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                        </svg>
                        <span style={{ fontSize:12,fontWeight:700,color:"white" }}>Pinterest</span>
                      </div>
                      <div style={{ fontSize:13,fontWeight:600,color:"white",lineHeight:1.3 }}>"{query} outfit"</div>
                      <div style={{ fontSize:11,color:"rgba(255,255,255,0.75)",lineHeight:1.4 }}>Visual inspiration linking back to products</div>
                      <div style={{ marginTop:4,fontSize:11,fontWeight:700,color:"white" }}>See inspiration ↗</div>
                    </a>
                  </div>

                  {/* ── Brand links ── */}
                  <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:C.textMuted,marginBottom:8 }}>Your Brands — "{query}"</div>
                  {activeBrands.map(brand => {
                    const url = buildSearchUrl(brand, query);
                    const isKnown = !!BRAND_SEARCH_URLS[brand];
                    return (
                      <a key={brand} href={url} target="_blank" rel="noreferrer"
                        style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:C.bgCard,border:`1.5px solid ${C.borderLight}`,borderRadius:10,padding:"12px 14px",marginBottom:7,textDecoration:"none" }}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=C.borderLight}>
                        <div style={{ fontSize:14,fontWeight:600,color:C.text }}>{brand}</div>
                        <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
                          {!isKnown && <span style={{ fontSize:9,fontWeight:700,color:C.accentSoft,background:C.bgHeader,padding:"2px 6px",borderRadius:99,textTransform:"uppercase",letterSpacing:"0.05em" }}>Google</span>}
                          <span style={{ fontSize:12,color:C.textMuted }}>↗</span>
                        </div>
                      </a>
                    );
                  })}
                </>
              )}
            </div>
          </>
        )}

        {/* ── Brands tab ── */}
        {tab==="brands" && (
          <div style={{ flex:1,overflowY:"auto",padding:"16px 20px 32px" }}>

            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:C.textMuted,marginBottom:8 }}>Add a brand</div>
              <div style={{ display:"flex",gap:8 }}>
                <input value={newBrand} onChange={e=>setNewBrand(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addBrand()}
                  placeholder='e.g. "Jenni Kayne" or "Equipment"'
                  style={{ flex:1,border:`1.5px solid ${C.border}`,borderRadius:8,padding:"9px 12px",fontSize:14,fontFamily:"'DM Sans',sans-serif",color:C.text,outline:"none",background:C.bgCard }} />
                <button onClick={addBrand} style={{ background:C.appBar,color:"#F0EDE6",border:"none",borderRadius:8,padding:"9px 18px",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>
                  Add
                </button>
              </div>
              <div style={{ fontSize:11,color:C.textMuted,marginTop:6,lineHeight:1.5 }}>
                Known brands get a direct search link. Unknown brands fall back to a Google search.
              </div>
            </div>

            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:C.textMuted,marginBottom:8 }}>
                Active brands — shown in every search
              </div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                {activeBrands.map(b=>(
                  <div key={b} style={{ display:"flex",alignItems:"center",gap:6,background:C.bgCard,border:`1.5px solid ${C.border}`,borderRadius:99,padding:"5px 12px" }}>
                    <span style={{ fontSize:13,color:C.text,fontWeight:500 }}>{b}</span>
                    {BRAND_SEARCH_URLS[b]
                      ? <span style={{ fontSize:9,color:C.purchased,fontWeight:700 }}>✓</span>
                      : <span style={{ fontSize:9,color:C.accentSoft,fontWeight:700 }}>G</span>}
                    <button onClick={()=>removeBrand(b)} style={{ background:"none",border:"none",cursor:"pointer",color:C.textMuted,fontSize:14,lineHeight:1,padding:0 }}>×</button>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:11,color:C.textLight,marginTop:8 }}>✓ = direct search link · G = Google fallback</div>
            </div>

            <div>
              <div style={{ fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:C.textMuted,marginBottom:8 }}>All known brands (tap to add)</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                {allKnownBrands.filter(b=>!activeBrands.includes(b)).map(b=>(
                  <button key={b} onClick={()=>onBrandsChange([...activeBrands, b])}
                    style={{ fontSize:12,color:C.textMid,background:C.bgHeader,border:`1px solid ${C.borderLight}`,borderRadius:99,padding:"4px 11px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
                    + {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


// ── Piece Edit/Add Form (shared, used in both views) ──────────────────────────
function PieceForm({ form, setForm, onSave, onCancel, isEdit }) {
  const handleFile = (file) => {
    if (!file) return;
    const r = new FileReader(); r.onload = e => setForm(f=>({...f,image:e.target.result})); r.readAsDataURL(file);
  };
  return (
    <div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12 }}>
        <FormField label="Name" style={{ gridColumn:"1/-1" }}><FIn v={form.name} onChange={v=>setForm(f=>({...f,name:v}))} ph="Effortless Pant"/></FormField>
        <FormField label="Brand"><FIn v={form.brand} onChange={v=>setForm(f=>({...f,brand:v}))} ph="Aritzia"/></FormField>
        <FormField label="Variant / Color"><FIn v={form.variant} onChange={v=>setForm(f=>({...f,variant:v}))} ph="Ivory"/></FormField>
        <FormField label="Price ($)"><FIn v={form.price} onChange={v=>setForm(f=>({...f,price:v}))} ph="148"/></FormField>
        <FormField label="Category">
          <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
            style={{ width:"100%",border:`1.5px solid ${C.border}`,borderRadius:6,padding:"9px 10px",fontSize:14,fontFamily:"'DM Sans',sans-serif",background:C.bgCard,color:C.text,outline:"none" }}>
            {Object.entries(CAT).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
        </FormField>
        <FormField label="Product Link" style={{ gridColumn:"1/-1" }}><FIn v={form.link} onChange={v=>setForm(f=>({...f,link:v}))} ph="https://..."/></FormField>
      </div>
      <FormField label="Image" style={{ marginBottom:12 }}>
        <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:8 }}>
          <label style={{ background:C.bgHeader,border:`1.5px solid ${C.border}`,borderRadius:6,padding:"9px 14px",cursor:"pointer",fontSize:13,fontWeight:600,color:C.textMid,fontFamily:"'DM Sans',sans-serif",flexShrink:0 }}>
            ↑ Upload
            <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleFile(e.target.files[0])}/>
          </label>
          <span style={{ color:C.textLight,fontSize:12 }}>or</span>
          <FIn v={form.image} onChange={v=>setForm(f=>({...f,image:v}))} ph="Paste URL"/>
        </div>
        {form.image&&(
          <div style={{ display:"flex",gap:10,alignItems:"flex-end" }}>
            <img src={form.image} alt="preview" style={{ height:72,objectFit:"cover",borderRadius:6,border:`1.5px solid ${C.border}` }} onError={()=>{}}/>
            <button onClick={()=>setForm(f=>({...f,image:""}))} style={{ fontSize:12,color:C.textMuted,background:"none",border:"none",cursor:"pointer",padding:0 }}>Remove</button>
          </div>
        )}
      </FormField>
      <label style={{ display:"flex",alignItems:"center",gap:10,marginBottom:20,cursor:"pointer" }}>
        <Checkbox checked={form.purchased} onChange={()=>setForm(f=>({...f,purchased:!f.purchased}))}/>
        <span style={{ fontSize:14,color:C.textMid,userSelect:"none" }}>Purchased</span>
      </label>
      <div style={{ display:"flex",gap:8 }}>
        <button onClick={onSave} style={{ flex:1,background:C.appBar,color:"#F0EDE6",border:"none",borderRadius:8,padding:"13px 0",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>
          {isEdit?"Save Changes":"Add to Library"}
        </button>
        <button onClick={onCancel} style={{ background:C.bgCard,color:C.textMid,border:`1.5px solid ${C.border}`,borderRadius:8,padding:"13px 16px",cursor:"pointer",fontSize:14 }}>Cancel</button>
      </div>
    </div>
  );
}
function FormField({ label, children, style={} }) {
  return <div style={style}><div style={{ fontSize:11,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:C.textMuted,marginBottom:5 }}>{label}</div>{children}</div>;
}
function FIn({ v, onChange, ph }) {
  return <input value={v} onChange={e=>onChange(e.target.value)} placeholder={ph} style={{ width:"100%",border:`1.5px solid ${C.border}`,borderRadius:6,padding:"9px 10px",fontSize:14,fontFamily:"'DM Sans',sans-serif",color:C.text,outline:"none",background:C.bgCard,boxSizing:"border-box" }}/>;
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║  MOBILE VIEW                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
function MobileApp({ pieces, setPieces, plan, setPlan, customBrands, setCustomBrands, signOut }) {
  const [tab, setTab] = useState("planner"); // "library" | "planner" | "find"
  const [catFilter, setCatFilter] = useState("all");
  const [editPiece, setEditPiece] = useState(null); // null | piece | "new"
  const [form, setForm] = useState(EMPTY_FORM);
  const [showDayPicker, setShowDayPicker] = useState(null); // pieceId when selecting day
  const [activeDay, setActiveDay] = useState(DAYS[0]);
  const [confirmDel, setConfirmDel] = useState(null);
  const [showFind, setShowFind] = useState(false);
  const [mixFlash, setMixFlash] = useState(false);

  const byId = id => pieces.find(p => p.id === id);
  const dayPieces = (plan[activeDay]||[]).map(id=>byId(id)).filter(Boolean);
  const shown = catFilter==="all" ? pieces : pieces.filter(p=>p.category===catFilter);

  const openAdd = () => { setForm(EMPTY_FORM); setEditPiece("new"); };
  const openEdit = (p) => { setForm({name:p.name,brand:p.brand,variant:p.variant||"",price:String(p.price),link:p.link,image:p.image,category:p.category,purchased:p.purchased||false}); setEditPiece(p); };

  const save = () => {
    if (!form.name.trim()) return;
    const d = {...form, price:parseFloat(form.price)||0};
    if (editPiece==="new") setPieces(prev=>[...prev,{id:`c${Date.now()}`,...d}]);
    else setPieces(prev=>prev.map(p=>p.id===editPiece.id?{...p,...d}:p));
    setEditPiece(null);
  };

  const doDelete = (id) => {
    setPieces(prev=>prev.filter(p=>p.id!==id));
    setPlan(prev=>{ const n={}; DAYS.forEach(d=>{n[d]=(prev[d]||[]).filter(i=>i!==id);}); return n; });
    setConfirmDel(null);
  };

  const togglePurchased = (id) => setPieces(prev=>prev.map(p=>p.id===id?{...p,purchased:!p.purchased}:p));

  const addToDay = (pieceId, day) => {
    setPlan(prev=>({ ...prev, [day]: prev[day]?.includes(pieceId) ? prev[day] : [...(prev[day]||[]), pieceId] }));
    setShowDayPicker(null);
  };

  const removeFromDay = (pieceId, day) => setPlan(prev=>({...prev,[day]:(prev[day]||[]).filter(id=>id!==pieceId)}));

  const mixItUp = () => {
    const r = generateOutfits(pieces);
    if (r) { setPlan(r); setMixFlash(true); setTimeout(()=>setMixFlash(false),500); }
  };

  const importLibrary = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.pieces && Array.isArray(data.pieces)) { setPieces(data.pieces); }
        if (data.plan && typeof data.plan === "object") { setPlan(data.plan); }
        alert(`Imported ${data.pieces?.length || 0} pieces successfully!`);
      } catch(err) { alert("Invalid file — please use a wardrobe-library.json export."); }
    };
    r.readAsText(file);
  };

  const dayTotal = day => (plan[day]||[]).reduce((s,id)=>{ const p=byId(id); return s+(p?p.price:0); },0);

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif",background:C.bg,height:"100vh",display:"flex",flexDirection:"column",color:C.text,overflow:"hidden" }}>
      {/* ── Mobile Header ── */}
      <div style={{ background:C.appBar,padding:"12px 16px 10px",flexShrink:0,paddingTop:"max(12px,env(safe-area-inset-top))" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <span style={{ fontFamily:"'DM Serif Display',serif",fontStyle:"italic",color:"#F0EDE6",fontSize:20 }}>Wardrobe Planner</span>
          <button onClick={signOut} style={{ background:"none",border:"none",color:"rgba(240,237,230,0.5)",fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:"2px 4px",marginLeft:4 }}>Sign out</button>
          <div style={{ display:"flex",gap:6 }}>
            {tab==="planner" && (
              <button onClick={mixItUp} style={{ background:mixFlash?C.mixFlash:C.appBarBtn,color:"#F0EDE6",border:"none",borderRadius:6,padding:"6px 10px",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>
                ✦ Mix
              </button>
            )}
            {tab==="library" && (
              <>
                <label style={{ background:C.appBarBtn,color:"#F0EDE6",border:"none",borderRadius:6,padding:"6px 10px",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:4 }}>
                  <svg width="12" height="13" viewBox="0 0 12 13" fill="none"><path d="M6 12V5M3 7l3-3 3 3" stroke="#F0EDE6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 10v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="#F0EDE6" strokeWidth="1.7" strokeLinecap="round"/></svg>
                  Import
                  <input type="file" accept=".json" style={{ display:"none" }} onChange={e=>importLibrary(e.target.files[0])}/>
                </label>
                <button onClick={openAdd} style={{ background:"#F0EDE6",color:C.appBar,border:"none",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>
                  + Add
                </button>
              </>
            )}
            <button onClick={()=>setShowFind(true)} style={{ background:C.appBarBtn,color:"#F0EDE6",border:"none",borderRadius:6,padding:"6px 10px",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="#F0EDE6" strokeWidth="1.7"/><path d="M9 9l2.5 2.5" stroke="#F0EDE6" strokeWidth="1.7" strokeLinecap="round"/></svg>
              Find new
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex:1,overflow:"hidden",display:"flex",flexDirection:"column",minHeight:0 }}>

        {/* PLANNER TAB */}
        {tab==="planner" && (
          <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
            {/* Day selector */}
            <div style={{ display:"flex",overflowX:"auto",background:C.bgHeader,borderBottom:`1px solid ${C.border}`,flexShrink:0,WebkitOverflowScrolling:"touch",scrollbarWidth:"none" }}>
              {DAYS.map((day,i)=>{
                const count = (plan[day]||[]).length;
                const isActive = activeDay===day;
                return (
                  <button key={day} onClick={()=>setActiveDay(day)}
                    style={{ flexShrink:0,padding:"10px 14px",background:"transparent",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",borderBottom:`2.5px solid ${isActive?C.accent:"transparent"}`,transition:"border-color .15s" }}>
                    <div style={{ fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:isActive?C.accent:C.textMuted,marginBottom:1 }}>{DAY_SHORT[i]}</div>
                    <div style={{ fontSize:13,fontWeight:isActive?600:400,color:isActive?C.text:C.textMid }}>{day.slice(0,3)}</div>
                    {count>0 && <div style={{ fontSize:9,color:isActive?C.accent:C.textLight,marginTop:1 }}>{count}</div>}
                  </button>
                );
              })}
            </div>

            {/* Day pieces */}
            <div style={{ flex:1,overflowY:"auto",padding:"12px 14px 24px",WebkitOverflowScrolling:"touch" }}>
              {/* Day summary */}
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                <span style={{ fontSize:16,fontWeight:600,color:C.text }}>{activeDay}</span>
                {dayPieces.length>0 && <span style={{ fontSize:12,color:C.accentSoft,fontWeight:500 }}>{dayPieces.length} pieces · ${dayTotal(activeDay)}</span>}
              </div>

              {dayPieces.length===0 && (
                <div style={{ border:`1.5px dashed ${C.border}`,borderRadius:10,padding:"28px 20px",textAlign:"center",color:C.textLight,marginBottom:12 }}>
                  <div style={{ fontSize:13,marginBottom:6 }}>No pieces planned</div>
                  <button onClick={()=>setTab("library")} style={{ fontSize:12,color:C.accent,background:"none",border:"none",cursor:"pointer",fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>
                    Browse library →
                  </button>
                </div>
              )}

              {dayPieces.map(p=>(
                <div key={p.id} style={{ background:C.bgCard,border:`1.5px solid ${C.borderLight}`,borderRadius:12,padding:"12px 14px",marginBottom:10,display:"flex",gap:12,alignItems:"center" }}>
                  <Thumb src={p.image} name={p.name} category={p.category} size={56}/>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:10,color:CAT_DOT[p.category]||C.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2 }}>{CAT[p.category]}</div>
                    <div style={{ fontSize:14,fontWeight:600,color:C.text,lineHeight:1.3 }}>{p.name}</div>
                    {p.variant&&<div style={{ fontSize:12,color:C.textMid }}>{p.variant}</div>}
                    <div style={{ fontSize:12,color:C.textMuted,marginTop:2 }}>{p.brand} · ${p.price}</div>
                    {p.purchased&&<div style={{ fontSize:10,color:C.purchased,fontWeight:600,marginTop:2 }}>✓ Purchased</div>}
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:6,alignItems:"center" }}>
                    {p.link&&<a href={p.link} target="_blank" rel="noreferrer" style={{ color:C.textLight,fontSize:14 }}>↗</a>}
                    <button onClick={()=>removeFromDay(p.id,activeDay)} style={{ background:"none",border:"none",cursor:"pointer",color:C.textLight,fontSize:20,lineHeight:1,padding:0 }}>×</button>
                  </div>
                </div>
              ))}

              <button onClick={()=>setTab("library")} style={{ width:"100%",background:C.bgHeader,border:`1.5px dashed ${C.border}`,borderRadius:10,padding:"12px",cursor:"pointer",fontSize:13,color:C.accentSoft,fontWeight:600,fontFamily:"'DM Sans',sans-serif",marginTop:4 }}>
                + Add pieces from library
              </button>
            </div>
          </div>
        )}

        {/* LIBRARY TAB */}
        {tab==="library" && (
          <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
            {/* Category filter */}
            <div style={{ display:"flex",gap:5,padding:"10px 12px",background:C.bgHeader,borderBottom:`1px solid ${C.border}`,overflowX:"auto",flexShrink:0,WebkitOverflowScrolling:"touch",scrollbarWidth:"none" }}>
              {["all","top","bottom","layer","shoes","bag"].map(f=>(
                <button key={f} onClick={()=>setCatFilter(f)}
                  style={{ flexShrink:0,fontSize:12,padding:"5px 12px",borderRadius:99,border:"1.5px solid",borderColor:catFilter===f?C.accent:C.border,background:catFilter===f?C.accent:"transparent",color:catFilter===f?"#F0EDE6":C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:500 }}>
                  {f==="all"?"All":CAT[f]}
                </button>
              ))}
            </div>

            <div style={{ flex:1,overflowY:"auto",padding:"10px 12px 24px",WebkitOverflowScrolling:"touch" }}>
              <div style={{ fontSize:11,color:C.textMuted,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:8 }}>
                {shown.length} piece{shown.length!==1?"s":""} · tap to add to a day
              </div>
              {shown.map(p=>(
                <div key={p.id} style={{ background:C.bgCard,border:`1.5px solid ${p.purchased?C.purchasedBg:C.borderLight}`,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",gap:12,alignItems:"center",position:"relative" }}>
                  <Thumb src={p.image} name={p.name} category={p.category} size={52} onClickEmpty={()=>openEdit(p)}/>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:2 }}>
                      <span style={{ width:6,height:6,borderRadius:"50%",background:CAT_DOT[p.category]||C.border,flexShrink:0 }}/>
                      <span style={{ fontSize:10,color:C.textMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em" }}>{p.brand}</span>
                      {p.purchased&&<span style={{ fontSize:9,background:C.purchased,color:"white",borderRadius:3,padding:"1px 5px",fontWeight:600 }}>✓</span>}
                    </div>
                    <div style={{ fontSize:13,fontWeight:600,color:C.text,lineHeight:1.3 }}>{p.name}{p.variant?` — ${p.variant}`:""}</div>
                    <div style={{ fontSize:12,color:C.textMid,marginTop:2 }}>${p.price} · {CAT[p.category]}</div>
                    {/* Days this piece is in */}
                    {DAYS.filter(d=>(plan[d]||[]).includes(p.id)).length>0 && (
                      <div style={{ display:"flex",gap:3,marginTop:4,flexWrap:"wrap" }}>
                        {DAYS.filter(d=>(plan[d]||[]).includes(p.id)).map(d=>(
                          <span key={d} style={{ fontSize:9,background:C.accent,color:"#F0EDE6",borderRadius:3,padding:"1px 5px",fontWeight:600 }}>{d.slice(0,2)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end",flexShrink:0 }}>
                    {/* Add to day button */}
                    <button onClick={()=>setShowDayPicker(showDayPicker===p.id?null:p.id)}
                      style={{ background:C.accent,color:"#F0EDE6",border:"none",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap" }}>
                      + Day
                    </button>
                    <div style={{ display:"flex",gap:4 }}>
                      <Checkbox checked={p.purchased} onChange={()=>togglePurchased(p.id)} small/>
                      <button onClick={()=>openEdit(p)} style={{ fontSize:11,background:C.bgHeader,border:"none",borderRadius:4,padding:"3px 7px",cursor:"pointer",color:C.textMid,fontFamily:"'DM Sans',sans-serif" }}>Edit</button>
                      <button onClick={()=>setConfirmDel(p.id)} style={{ fontSize:11,background:"#F5E6E4",border:"none",borderRadius:4,padding:"3px 7px",cursor:"pointer",color:C.danger,fontFamily:"'DM Sans',sans-serif" }}>Del</button>
                    </div>
                  </div>

                  {/* Day picker dropdown */}
                  {showDayPicker===p.id && (
                    <div style={{ position:"absolute",right:14,top:60,background:"white",border:`1.5px solid ${C.border}`,borderRadius:10,zIndex:100,boxShadow:"0 8px 24px rgba(0,0,0,0.12)",overflow:"hidden",minWidth:130 }}>
                      {DAYS.map(day=>{
                        const inDay = (plan[day]||[]).includes(p.id);
                        return (
                          <button key={day} onClick={()=>inDay?removeFromDay(p.id,day):addToDay(p.id,day)}
                            style={{ display:"block",width:"100%",padding:"10px 14px",background:inDay?C.purchasedBg:"transparent",border:"none",borderBottom:`1px solid ${C.borderLight}`,cursor:"pointer",fontSize:13,textAlign:"left",color:inDay?C.purchased:C.text,fontFamily:"'DM Sans',sans-serif",fontWeight:inDay?600:400 }}>
                            {inDay?"✓ ":""}{day}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Tab Bar ── */}
      <div style={{ background:C.tabBar,display:"flex",alignItems:"stretch",flexShrink:0,paddingBottom:"env(safe-area-inset-bottom)",borderTop:`1px solid #333` }}>
        {[
          { id:"planner", label:"Planner", icon: (active) => {
            const s = active ? C.tabActive : C.tabInactive;
            return (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="3" y="4.5" width="16" height="14" rx="1.5" stroke={s} strokeWidth="1.2"/>
                <path d="M7.5 2.5v4M14.5 2.5v4" stroke={s} strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M3 9h16" stroke={s} strokeWidth="1.2"/>
                <path d="M6.5 12.5h3M6.5 15.5h5M12.5 12.5h3" stroke={s} strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
            );
          }},
          { id:"library", label:"Library", icon: (active) => {
            const s = active ? C.tabActive : C.tabInactive;
            return (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="3" y="5" width="5" height="14" rx="1" stroke={s} strokeWidth="1.2"/>
                <rect x="9.5" y="3" width="5" height="16" rx="1" stroke={s} strokeWidth="1.2"/>
                <path d="M16.5 6.5l1.8 12.5" stroke={s} strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            );
          }},
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ flex:1,background:"transparent",border:"none",cursor:"pointer",padding:"10px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
            {t.icon(tab===t.id)}
            <span style={{ fontSize:10,fontWeight:tab===t.id?600:400,color:tab===t.id?C.tabActive:C.tabInactive,fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.04em",textTransform:"uppercase" }}>{t.label}</span>
            {tab===t.id && <span style={{ width:18,height:2,background:C.tabActive,borderRadius:1,display:"block" }}/>}
          </button>
        ))}
      </div>

      {/* ── Edit/Add sheet ── */}
      {editPiece && (
        <div style={{ position:"fixed",inset:0,background:"rgba(30,28,26,0.5)",zIndex:400,display:"flex",alignItems:"flex-end" }} onClick={()=>setEditPiece(null)}>
          <div style={{ background:C.bg,borderRadius:"16px 16px 0 0",width:"100%",maxHeight:"92vh",overflowY:"auto",padding:"20px 16px",boxShadow:"0 -8px 40px rgba(0,0,0,0.2)",paddingBottom:"max(20px,env(safe-area-inset-bottom))" }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:20,color:C.text,marginBottom:18 }}>
              {editPiece==="new"?"Add New Piece":"Edit Piece"}
            </div>
            <PieceForm form={form} setForm={setForm} onSave={save} onCancel={()=>setEditPiece(null)} isEdit={editPiece!=="new"}/>
          </div>
        </div>
      )}

      {/* ── Confirm delete sheet ── */}
      {confirmDel && (
        <div style={{ position:"fixed",inset:0,background:"rgba(30,28,26,0.5)",zIndex:400,display:"flex",alignItems:"flex-end" }} onClick={()=>setConfirmDel(null)}>
          <div style={{ background:C.bg,borderRadius:"16px 16px 0 0",width:"100%",padding:"24px 16px",boxShadow:"0 -8px 40px rgba(0,0,0,0.2)",paddingBottom:"max(20px,env(safe-area-inset-bottom))" }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:20,color:C.text,marginBottom:10 }}>Remove piece?</div>
            <p style={{ color:C.textMid,fontSize:14,marginBottom:20,lineHeight:1.5 }}>
              <strong>{pieces.find(p=>p.id===confirmDel)?.name}</strong> will be removed from your library and all days.
            </p>
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={()=>doDelete(confirmDel)} style={{ flex:1,background:C.danger,color:"white",border:"none",borderRadius:8,padding:"13px 0",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>Remove</button>
              <button onClick={()=>setConfirmDel(null)} style={{ background:C.bgCard,color:C.textMid,border:`1.5px solid ${C.border}`,borderRadius:8,padding:"13px 18px",cursor:"pointer",fontSize:14 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showFind && <FindNewModal pieces={pieces} customBrands={customBrands} onBrandsChange={setCustomBrands} onClose={()=>setShowFind(false)} onAdd={item=>setPieces(prev=>[...prev,item])}/>}

      {/* Close day picker on outside tap */}
      {showDayPicker && <div style={{ position:"fixed",inset:0,zIndex:99 }} onClick={()=>setShowDayPicker(null)}/>}
    </div>
  );
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║  DESKTOP VIEW                                                     ║
// ╚══════════════════════════════════════════════════════════════════╝
function DesktopApp({ pieces, setPieces, plan, setPlan, customBrands, setCustomBrands, signOut }) {
  const [sidebar, setSidebar]     = useState(true);
  const [catFilter, setCatFilter] = useState("all");
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [delId,  setDelId]  = useState(null);
  const [showFind, setShowFind]   = useState(false);
  const [mixFlash, setMixFlash]   = useState(false);

  const dragRef  = useRef(null);
  const [overZone, setOverZone] = useState(null);

  const byId = id => pieces.find(p => p.id === id);

  const onDragStart = useCallback((e, pieceId, fromDay) => {
    dragRef.current = { pieceId, fromDay };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", pieceId);
  }, []);
  const onDragOver = useCallback((e, zone) => {
    e.preventDefault(); e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setOverZone(zone);
  }, []);
  const onDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setOverZone(null);
  }, []);
  const onDrop = useCallback((e, toZone) => {
    e.preventDefault(); e.stopPropagation();
    setOverZone(null);
    const info = dragRef.current; if (!info) return;
    const { pieceId, fromDay } = info; dragRef.current = null;
    if (toZone === "__lib__") {
      if (fromDay && DAYS.includes(fromDay))
        setPlan(prev => ({ ...prev, [fromDay]: prev[fromDay].filter(id=>id!==pieceId) }));
      return;
    }
    setPlan(prev => {
      const n = {}; DAYS.forEach(d => { n[d] = [...(prev[d]||[])]; });
      if (fromDay && DAYS.includes(fromDay)) n[fromDay] = n[fromDay].filter(id=>id!==pieceId);
      if (!n[toZone].includes(pieceId)) n[toZone].push(pieceId);
      return n;
    });
  }, [setPlan]);
  const onDragEnd = useCallback(() => { dragRef.current = null; setOverZone(null); }, []);

  const removeFrom = (pieceId, day) => setPlan(prev=>({...prev,[day]:prev[day].filter(id=>id!==pieceId)}));
  const openAdd = () => { setForm(EMPTY_FORM); setModal({mode:"add"}); };
  const openEdit = p => { setForm({name:p.name,brand:p.brand,variant:p.variant||"",price:String(p.price),link:p.link,image:p.image,category:p.category,purchased:p.purchased||false}); setModal({mode:"edit",id:p.id}); };
  const save = () => {
    if (!form.name.trim()) return;
    const d = {...form, price:parseFloat(form.price)||0};
    if (modal.mode==="add") setPieces(prev=>[...prev,{id:`c${Date.now()}`,...d}]);
    else setPieces(prev=>prev.map(p=>p.id===modal.id?{...p,...d}:p));
    setModal(null);
  };
  const doDelete = id => {
    setPieces(prev=>prev.filter(p=>p.id!==id));
    setPlan(prev=>{ const n={}; DAYS.forEach(d=>{n[d]=(prev[d]||[]).filter(i=>i!==id);}); return n; });
    setDelId(null);
  };
  const togglePurchased = (id,e) => { e.stopPropagation(); setPieces(prev=>prev.map(p=>p.id===id?{...p,purchased:!p.purchased}:p)); };
  const mixItUp = () => { const r=generateOutfits(pieces); if(r){setPlan(r);setMixFlash(true);setTimeout(()=>setMixFlash(false),500);} };
  const openExport = () => {
    const json = JSON.stringify({ exportedAt: new Date().toISOString(), pieces, plan }, null, 2);
    const w = window.open("", "_blank");
    if (w) {
      w.document.write('<html><head><title>wardrobe-library.json</title></head><body><pre style="font-family:monospace;font-size:12px;line-height:1.6;padding:20px;white-space:pre-wrap;word-break:break-all">' + json.replace(/</g,"&lt;").replace(/>/g,"&gt;") + '</pre><p style="font-family:sans-serif;color:#888;padding:0 20px">Press Ctrl+S (Cmd+S on Mac) to save this file, or copy all the text above.</p></body></html>');
      w.document.close();
    }
  };
  const importLibrary = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.pieces && Array.isArray(data.pieces)) setPieces(data.pieces);
        if (data.plan && typeof data.plan === "object") setPlan(data.plan);
        alert(`Imported ${data.pieces?.length || 0} pieces successfully!`);
      } catch(err) { alert("Invalid file — please use a wardrobe-library.json export."); }
    };
    r.readAsText(file);
  };
  const dayTotal = day => (plan[day]||[]).reduce((s,id)=>{ const p=byId(id); return s+(p?p.price:0); },0);
  const shown = catFilter==="all"?pieces:pieces.filter(p=>p.category===catFilter);

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif",background:C.bg,height:"100vh",display:"flex",flexDirection:"column",fontSize:14,color:C.text,overflow:"hidden" }}>
      <header style={{ height:50,background:C.appBar,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 18px",flexShrink:0,gap:12 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <button onClick={()=>setSidebar(s=>!s)} title={sidebar?"Collapse":"Expand"}
            style={{ background:"none",border:"none",cursor:"pointer",color:"#8A8278",padding:"4px 6px",lineHeight:0 }}>
            {sidebar
              ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4L12 9L7 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            }
          </button>
          <span style={{ fontFamily:"'DM Serif Display',serif",fontStyle:"italic",color:"#F0EDE6",fontSize:19,letterSpacing:"-0.01em" }}>Wardrobe Planner</span>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <HdrBtn onClick={()=>setShowFind(true)} icon="🔍" label="Find something new"/>
          <HdrBtn onClick={mixItUp} icon="✦" label="Mix it up!" flash={mixFlash}/>
          <HdrBtn onClick={openExport} icon="↓" label="Export"/>
          <HdrBtn onClick={signOut} icon="→" label="Sign out"/>
          <label style={{ background:C.appBarBtn,color:"#F0EDE6",border:"none",borderRadius:6,padding:"7px 15px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6 }}>
            <span style={{ fontSize:13 }}>↑</span>Import
            <input type="file" accept=".json" style={{ display:"none" }} onChange={e=>importLibrary(e.target.files[0])}/>
          </label>
          <button onClick={openAdd} style={{ background:"#F0EDE6",color:C.appBar,border:"none",borderRadius:6,padding:"7px 16px",cursor:"pointer",fontSize:12,fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif" }}>+ Add Piece</button>
        </div>
      </header>

      <div style={{ display:"flex",flex:1,overflow:"hidden",minHeight:0 }}>
        {sidebar && (
          <aside onDragOver={e=>onDragOver(e,"__lib__")} onDragLeave={onDragLeave} onDrop={e=>onDrop(e,"__lib__")}
            style={{ width:256,background:overZone==="__lib__"?C.bgHeader:C.bgAlt,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,transition:"background .12s" }}>
            <div style={{ padding:"12px 12px 8px",borderBottom:`1px solid ${C.border}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                <span style={{ fontSize:11,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",color:C.textMuted }}>Library · {pieces.length}</span>
                {pieces.filter(p=>p.purchased).length>0&&<span style={{ fontSize:10,background:C.purchased,color:"white",borderRadius:3,padding:"2px 7px",fontWeight:600 }}>✓ {pieces.filter(p=>p.purchased).length} bought</span>}
              </div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                {["all","top","bottom","layer","shoes","bag"].map(f=>(
                  <button key={f} onClick={()=>setCatFilter(f)}
                    style={{ fontSize:11,padding:"3px 10px",borderRadius:99,border:"1.5px solid",borderColor:catFilter===f?C.accent:C.border,background:catFilter===f?C.accent:"transparent",color:catFilter===f?"#F0EDE6":C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:500,transition:"all .12s" }}>
                    {f==="all"?"All":CAT[f]}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex:1,overflowY:"auto",padding:"8px 8px 16px" }}>
              {shown.map(p=>(
                <DLibCard key={p.id} piece={p} used={DAYS.filter(d=>(plan[d]||[]).includes(p.id))} onDragStart={e=>onDragStart(e,p.id,null)} onDragEnd={onDragEnd} onEdit={()=>openEdit(p)} onDel={()=>setDelId(p.id)} onToggle={e=>togglePurchased(p.id,e)}/>
              ))}
              {shown.length===0&&<div style={{ color:C.textLight,fontSize:12,textAlign:"center",marginTop:24,fontStyle:"italic" }}>No pieces</div>}
            </div>
          </aside>
        )}

        <main style={{ flex:1,overflowY:"auto",overflowX:"hidden",display:"flex",flexDirection:"column",background:C.bg }}>
          {DAYS.map((day,i)=>{
            const isWeekend=i>=5, dayPieces=(plan[day]||[]).map(id=>byId(id)).filter(Boolean), isOver=overZone===day;
            return (
              <div key={day} onDragOver={e=>onDragOver(e,day)} onDragLeave={onDragLeave} onDrop={e=>onDrop(e,day)}
                style={{ display:"flex",flexDirection:"column",borderBottom:`1px solid ${C.border}`,background:isOver?"#E4E0F0":isWeekend?C.bgWeekend:C.bg,transition:"background .12s",flexShrink:0 }}>
                <div style={{ display:"flex",alignItems:"baseline",justifyContent:"space-between",padding:"10px 16px 8px",background:isWeekend?C.bgHeaderWk:C.bgHeader,borderBottom:`1px solid ${C.borderLight}` }}>
                  <div style={{ display:"flex",alignItems:"baseline",gap:10 }}>
                    <span style={{ fontSize:9,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:isWeekend?C.textLight:C.textMuted }}>{DAY_SHORT[i]}</span>
                    <span style={{ fontSize:17,fontWeight:600,letterSpacing:"-0.02em",color:isWeekend?C.textMuted:C.text }}>{day}</span>
                  </div>
                  {dayPieces.length>0&&(
                    <div style={{ display:"flex",gap:12,alignItems:"center" }}>
                      <span style={{ fontSize:11,color:C.textMuted }}>{dayPieces.length} piece{dayPieces.length!==1?"s":""}</span>
                      <span style={{ fontSize:11,fontWeight:600,color:C.accent }}>${dayTotal(day)}</span>
                    </div>
                  )}
                </div>
                <div style={{ display:"flex",alignItems:"flex-start",flexWrap:"wrap",gap:8,padding:"12px 16px",minHeight:72 }}>
                  {dayPieces.length===0&&<div style={{ border:`1.5px dashed ${C.border}`,borderRadius:8,padding:"10px 20px",color:C.textLight,fontSize:12,fontStyle:"italic",alignSelf:"center" }}>Drag pieces here</div>}
                  {dayPieces.map(p=>(
                    <DPieceCard key={p.id} piece={p} onDragStart={e=>onDragStart(e,p.id,day)} onDragEnd={onDragEnd} onRemove={()=>removeFrom(p.id,day)}/>
                  ))}
                </div>
              </div>
            );
          })}
        </main>
      </div>

      {modal&&(
        <DOverlay onClose={()=>setModal(null)}>
          <div style={{ fontSize:19,fontFamily:"'DM Serif Display',serif",fontStyle:"italic",color:C.text,marginBottom:20 }}>{modal.mode==="add"?"Add New Piece":"Edit Piece"}</div>
          <PieceForm form={form} setForm={setForm} onSave={save} onCancel={()=>setModal(null)} isEdit={modal.mode==="edit"}/>
        </DOverlay>
      )}
      {delId&&(
        <DOverlay onClose={()=>setDelId(null)}>
          <div style={{ fontSize:19,fontFamily:"'DM Serif Display',serif",fontStyle:"italic",color:C.text,marginBottom:14 }}>Remove piece?</div>
          <p style={{ color:C.textMid,fontSize:14,marginBottom:20,lineHeight:1.5 }}><strong>{byId(delId)?.name}{byId(delId)?.variant?` — ${byId(delId)?.variant}`:""}</strong> will be removed from your library and all days.</p>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={()=>doDelete(delId)} style={{ flex:1,background:C.danger,color:"white",border:"none",borderRadius:7,padding:"10px 0",cursor:"pointer",fontSize:13,fontWeight:600 }}>Remove</button>
            <button onClick={()=>setDelId(null)} style={{ background:C.bgCard,color:C.textMid,border:`1.5px solid ${C.border}`,borderRadius:7,padding:"10px 16px",cursor:"pointer",fontSize:13 }}>Cancel</button>
          </div>
        </DOverlay>
      )}
      {showFind&&<FindNewModal pieces={pieces} customBrands={customBrands} onBrandsChange={setCustomBrands} onClose={()=>setShowFind(false)} onAdd={item=>setPieces(prev=>[...prev,item])}/>}
    </div>
  );
}

function DLibCard({ piece, used, onDragStart, onDragEnd, onEdit, onDel, onToggle }) {
  const [hov, setHov] = useState(false);
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"flex",gap:9,alignItems:"flex-start",background:hov?C.bgCardHov:C.bgCard,border:`1px solid ${piece.purchased?C.purchasedBg:C.borderLight}`,borderRadius:8,padding:"9px 10px",marginBottom:5,cursor:"grab",position:"relative",transition:"background .1s" }}>
      <Thumb src={piece.image} name={piece.name} category={piece.category} size={44} onClickEmpty={onEdit}/>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:2 }}>
          <span style={{ width:6,height:6,borderRadius:"50%",background:CAT_DOT[piece.category]||C.textMuted,flexShrink:0 }}/>
          <span style={{ fontSize:10,color:C.textMuted,fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase" }}>{piece.brand}</span>
          {piece.purchased&&<span style={{ fontSize:9,background:C.purchased,color:"white",borderRadius:3,padding:"1px 5px",fontWeight:600 }}>✓</span>}
        </div>
        <div style={{ fontSize:12,fontWeight:500,color:C.text,lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{piece.name}{piece.variant?` — ${piece.variant}`:""}</div>
        <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:3 }}>
          <span style={{ fontSize:11,color:C.textMid }}>${piece.price}</span>
          {used.length>0&&<span style={{ fontSize:9,fontWeight:600,background:C.accent,color:"#F0EDE6",padding:"1px 5px",borderRadius:3 }}>{used.map(d=>d.slice(0,2)).join("·")}</span>}
          {piece.link&&<a href={piece.link} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{ color:C.border,fontSize:11 }}>↗</a>}
        </div>
      </div>
      <Checkbox checked={piece.purchased} onChange={onToggle} small/>
      {hov&&(
        <div style={{ position:"absolute",bottom:6,right:6,display:"flex",gap:3 }}>
          <MiniBtn onClick={e=>{e.stopPropagation();onEdit();}} bg={C.bgHeader} c={C.textMid}>Edit</MiniBtn>
          <MiniBtn onClick={e=>{e.stopPropagation();onDel();}} bg="#F5E6E4" c={C.danger}>Del</MiniBtn>
        </div>
      )}
    </div>
  );
}

function DPieceCard({ piece, onDragStart, onDragEnd, onRemove }) {
  const [hov, setHov] = useState(false);
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:C.bgCard,border:`1.5px solid ${hov?C.accentSoft:C.borderLight}`,borderRadius:10,padding:"10px 12px 10px 10px",cursor:"grab",display:"flex",gap:10,alignItems:"center",boxShadow:hov?`0 2px 10px rgba(42,37,32,0.1)`:"none",maxWidth:200,minWidth:148,transition:"all .1s" }}>
      <Thumb src={piece.image} name={piece.name} category={piece.category} size={52}/>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontSize:9,color:CAT_DOT[piece.category]||C.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2 }}>{CAT[piece.category]}</div>
        <div style={{ fontSize:12,fontWeight:600,color:C.text,lineHeight:1.3,marginBottom:1 }}>{piece.name}</div>
        {piece.variant&&<div style={{ fontSize:11,color:C.textMid,marginBottom:2 }}>{piece.variant}</div>}
        <div style={{ fontSize:10,color:C.textMuted }}>{piece.brand} · <span style={{ fontWeight:500,color:C.textMid }}>${piece.price}</span></div>
        {piece.purchased&&<div style={{ fontSize:9,color:C.purchased,fontWeight:600,marginTop:2 }}>✓ Purchased</div>}
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:5,flexShrink:0,alignItems:"center" }}>
        {piece.link&&<a href={piece.link} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{ color:C.border,fontSize:12 }}>↗</a>}
        <button onClick={e=>{e.stopPropagation();onRemove();}} style={{ background:"none",border:"none",cursor:"pointer",color:hov?C.danger:C.border,fontSize:16,lineHeight:1,padding:0,transition:"color .1s" }}>×</button>
      </div>
    </div>
  );
}

function DOverlay({ onClose, children }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(30,28,26,0.45)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={onClose}>
      <div style={{ background:C.bg,borderRadius:12,width:"100%",maxWidth:480,padding:28,position:"relative",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 50px rgba(0,0,0,0.2)" }} onClick={e=>e.stopPropagation()}>
        {children}
        <button onClick={onClose} style={{ position:"absolute",top:14,right:16,background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.textLight,lineHeight:1 }}>×</button>
      </div>
    </div>
  );
}

function HdrBtn({ onClick, icon, label, flash }) {
  return (
    <button onClick={onClick} style={{ background:flash?C.mixFlash:C.appBarBtn,color:"#F0EDE6",border:"none",borderRadius:6,padding:"7px 15px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6,transition:"background .3s" }}>
      <span style={{ fontSize:13 }}>{icon}</span>{label}
    </button>
  );
}

// ── Login screen ──────────────────────────────────────────────────────────────
function LoginScreen() {
   const [email, setEmail]       = useState("");
 const [password, setPassword] = useState("");
 const [isSignUp, setIsSignUp] = useState(false);
 const [error, setError]       = useState("");
 const [loading, setLoading]   = useState(false);
 const [success, setSuccess]   = useState("");
 const submit = async () => {
   const e = email.trim();
   const p = password.trim();
   if (!e || !p) { setError("Please enter your email and password."); return; }
   setLoading(true); setError(""); setSuccess("");
   if (isSignUp) {
     const { error: err } = await supabase.auth.signUp({ email: e, password: p });
     setLoading(false);
     if (err) setError(err.message);
     else setSuccess("Account created! You can now sign in.");
   } else {
     const { error: err } = await supabase.auth.signInWithPassword({ email: e, password: p });
     setLoading(false);
     if (err) setError(err.message);
   }
 };
 const inputStyle = { width:"100%",border:`1.5px solid ${C.border}`,borderRadius:8,padding:"11px 14px",fontSize:15,fontFamily:"'DM Sans',sans-serif",color:C.text,outline:"none",background:C.bg,boxSizing:"border-box",marginBottom:10 };
 return (
<div style={{ minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",padding:24 }}>
<div style={{ width:"100%",maxWidth:400,background:C.bgCard,borderRadius:16,padding:"40px 32px",boxShadow:"0 4px 32px rgba(0,0,0,0.08)" }}>
<div style={{ fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:28,color:C.text,marginBottom:4 }}>Wardrobe</div>
<div style={{ fontSize:13,color:C.textMuted,marginBottom:28 }}>Your executive capsule planner</div>
<div style={{ fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:C.textMuted,marginBottom:6 }}>
         {isSignUp ? "Create account" : "Sign in"}
</div>
<input value={email} onChange={e=>setEmail(e.target.value)}
         onKeyDown={e=>e.key==="Enter"&&submit()}
         placeholder="you@example.com" type="email" style={inputStyle}/>
<input value={password} onChange={e=>setPassword(e.target.value)}
         onKeyDown={e=>e.key==="Enter"&&submit()}
         placeholder="Password" type="password" style={inputStyle}/>
       {error   && <div style={{ fontSize:12,color:C.danger,marginBottom:8 }}>{error}</div>}
       {success && <div style={{ fontSize:12,color:C.purchased,marginBottom:8 }}>{success}</div>}
<button onClick={submit} disabled={loading}
         style={{ width:"100%",background:C.appBar,color:"#F0EDE6",border:"none",borderRadius:8,padding:"13px 0",cursor:loading?"wait":"pointer",fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",marginBottom:12 }}>
         {loading ? "Please wait…" : isSignUp ? "Create account →" : "Sign in →"}
</button>
<div style={{ textAlign:"center",fontSize:13,color:C.textMuted }}>
         {isSignUp ? "Already have an account? " : "New here? "}
<button onClick={()=>{ setIsSignUp(!isSignUp); setError(""); setSuccess(""); }}
           style={{ background:"none",border:"none",cursor:"pointer",color:C.accent,fontWeight:600,fontSize:13,fontFamily:"'DM Sans',sans-serif",textDecoration:"underline" }}>
           {isSignUp ? "Sign in" : "Create account"}
</button>
</div>
<div style={{ fontSize:11,color:C.textLight,marginTop:16,lineHeight:1.6,textAlign:"center" }}>
         Same email & password on any device keeps your wardrobe in sync.
</div>
</div>
</div>
 );
}
// ╔══════════════════════════════════════════════════════════════════╗
// ║  ROOT — auth gate + shared state, auto-detects mobile/desktop   ║
// ╚══════════════════════════════════════════════════════════════════╝
export default function App() {
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen for auth state (handles magic link callback automatically)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const [pieces, setPieces]             = useStore(STORAGE_PIECES, SEED_PIECES, userId);
  const [plan,   setPlan]               = useStore(STORAGE_PLAN,   SEED_PLAN,   userId);
  const [customBrands, setCustomBrands] = useStore(STORAGE_BRANDS, [],           userId);
  const isMobile = useIsMobile();

  const signOut = () => supabase.auth.signOut();

  if (authLoading) return (
    <div style={{ minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ fontSize:13,color:C.textMuted,fontFamily:"'DM Sans',sans-serif" }}>Loading…</div>
    </div>
  );

  if (!userId) return <LoginScreen />;

  const props = { pieces, setPieces, plan, setPlan, customBrands, setCustomBrands, signOut };

  return isMobile ? <MobileApp {...props}/> : <DesktopApp {...props}/>;
}
