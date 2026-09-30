"use client";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/lib/products.server";
import { ProductCard } from "@/components/product-card";

export function ProductCatalogue({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [search,setSearch]=useState(params.get("search")||"");
  const [category,setCategory]=useState(params.get("category")||"");
  const [condition,setCondition]=useState(params.get("condition")||"");
  const [size,setSize]=useState(params.get("size")||"");
  const [availability,setAvailability]=useState(params.get("availability")||"available");
  const [sort,setSort]=useState(params.get("sort")||"newest");
  const [filtersOpen,setFiltersOpen]=useState(false);
  const categories=[...new Set(initialProducts.map(p=>p.category).filter(Boolean))].sort();
  const sizes=[...new Set(initialProducts.flatMap(p=>(p.sizes||[]).map(String)))].sort((a,b)=>Number(a)-Number(b));
  const products=useMemo(()=>initialProducts.filter(p=>{const term=search.trim().toLowerCase(); return (!term||`${p.name} ${p.category}`.toLowerCase().includes(term))&&(!category||p.category===category)&&(!condition||p.condition===condition)&&(!size||(p.sizes||[]).map(String).includes(size))&&(availability!=="available"||(p.inStock!==false&&(p.stockQuantity??1)>0));}).sort((a,b)=>sort==="price-low"?a.price-b.price:sort==="price-high"?b.price-a.price:sort==="rating"?(b.rating||0)-(a.rating||0):b.id-a.id),[initialProducts,search,category,condition,size,availability,sort]);
  const activeCount=[category,condition,size,availability==="all"?"all":""].filter(Boolean).length;
  function update(key:string,value:string){const next={search,category,condition,size,availability,sort,[key]:value}; const q=new URLSearchParams(); Object.entries(next).forEach(([k,v])=>{if(v && !(k==="availability"&&v==="available") && !(k==="sort"&&v==="newest"))q.set(k,v)}); router.replace(`/products${q.size?`?${q}`:""}`,{scroll:false}); ({search:setSearch,category:setCategory,condition:setCondition,size:setSize,availability:setAvailability,sort:setSort} as Record<string,(v:string)=>void>)[key](value);}
  function clear(){setCategory("");setCondition("");setSize("");setAvailability("available");router.replace("/products",{scroll:false});}
  const field="h-11 w-full rounded-xl border border-black/15 bg-cream px-3 text-sm font-medium outline-none transition focus:border-rust focus:ring-2 focus:ring-rust/15";
  return <>
    <section className="border-b border-black/10 bg-sand"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><p className="eyebrow">The current rack</p><h1 className="section-title">Find your next old favourite.</h1><p className="mt-5 max-w-xl text-ink/65">Every listing is an individual pre-loved pair. When it’s gone, it’s gone.</p></div></section>
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center"><label className="relative flex-1"><span className="sr-only">Search the rack</span><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink/45"/><input className="h-12 w-full rounded-full border border-black/15 bg-card pl-11 pr-4 text-sm outline-none transition focus:border-rust focus:ring-2 focus:ring-rust/15" value={search} placeholder="Search by name or style…" onChange={e=>update("search",e.target.value)} /></label><button onClick={()=>setFiltersOpen(!filtersOpen)} className="flex h-12 items-center justify-center gap-2 rounded-full border border-black/15 px-5 text-sm font-bold md:hidden"><SlidersHorizontal className="size-4"/> Filters {activeCount>0&&<span className="rounded-full bg-rust px-2 py-0.5 text-[10px] text-white">{activeCount}</span>}</button><select aria-label="Sort products" className="h-12 rounded-full border border-black/15 bg-card px-5 text-sm font-bold outline-none" value={sort} onChange={e=>update("sort",e.target.value)}><option value="newest">Newest first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Highest rated</option></select></div>
      <div className={`mt-6 rounded-[1.5rem] border border-black/10 bg-card p-5 ${filtersOpen?"block":"hidden md:block"}`}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Filter label="Category"><select className={field} value={category} onChange={e=>update("category",e.target.value)}><option value="">All styles</option>{categories.map(v=><option key={v}>{v}</option>)}</select></Filter><Filter label="Size"><select className={field} value={size} onChange={e=>update("size",e.target.value)}><option value="">Any size</option>{sizes.map(v=><option key={v}>{v}</option>)}</select></Filter><Filter label="Condition"><select className={field} value={condition} onChange={e=>update("condition",e.target.value)}><option value="">Any condition</option>{["like-new","excellent","good","fair"].map(v=><option key={v} value={v}>{v.replace("-"," ")}</option>)}</select></Filter><Filter label="Availability"><select className={field} value={availability} onChange={e=>update("availability",e.target.value)}><option value="available">In stock only</option><option value="all">Show sold pairs</option></select></Filter></div>{activeCount>0&&<button onClick={clear} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-rust"><X className="size-3"/> Clear filters</button>}</div>
      <div className="mb-6 mt-10 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-rust">{products.length} pair{products.length===1?"":"s"}</p><h2 className="mt-1 font-display text-3xl font-black tracking-tight">On the rack</h2></div></div>
      {products.length?<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map(p=><ProductCard key={p.id} product={p as any} />)}</div>:<div className="rounded-[2rem] border border-dashed border-black/20 px-6 py-20 text-center"><h2 className="font-display text-3xl font-black">Nothing in that corner of the rack.</h2><p className="mt-3 text-sm text-muted-foreground">Try another size or clear your filters.</p><button onClick={clear} className="mt-6 rounded-full bg-rust px-5 py-3 text-sm font-bold text-white">Clear filters</button></div>}
    </section>
  </>;
}
function Filter({label,children}:{label:string;children:React.ReactNode}){return <label><span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[.15em] text-ink/50">{label}</span>{children}</label>}
