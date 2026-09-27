"use client";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/lib/products.server";
import { ProductCard } from "@/components/product-card";

export function ProductCatalogue({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter(), params = useSearchParams();
  const [search,setSearch]=useState(params.get("search")||""); const [category,setCategory]=useState(params.get("category")||"");
  const [condition,setCondition]=useState(params.get("condition")||""); const [size,setSize]=useState(params.get("size")||"");
  const [availability,setAvailability]=useState(params.get("availability")||"available"); const [sort,setSort]=useState(params.get("sort")||"newest");
  const categories=[...new Set(initialProducts.map(p=>p.category).filter(Boolean))].sort();
  const sizes=[...new Set(initialProducts.flatMap(p=>(p.sizes||[]).map(String)))].sort((a,b)=>Number(a)-Number(b));
  const products=useMemo(()=>initialProducts.filter(p=>{const term=search.trim().toLowerCase(); return (!term||`${p.name} ${p.category}`.toLowerCase().includes(term))&&(!category||p.category===category)&&(!condition||p.condition===condition)&&(!size||(p.sizes||[]).map(String).includes(size))&&(availability!=="available"||(p.inStock!==false&&(p.stockQuantity??1)>0));}).sort((a,b)=>sort==="price-low"?a.price-b.price:sort==="price-high"?b.price-a.price:sort==="rating"?(b.rating||0)-(a.rating||0):b.id-a.id),[initialProducts,search,category,condition,size,availability,sort]);
  function sync(next:Record<string,string>){const q=new URLSearchParams({search,category,condition,size,availability,sort,...next}); for(const [k,v] of [...q.entries()])if(!v)q.delete(k); router.replace(`/products?${q}`,{scroll:false});}
  const field="rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
  return <><section className="border-b border-border bg-muted/30 py-8"><div className="mx-auto max-w-7xl px-4"><h1 className="text-4xl font-bold">All Products</h1><p className="mt-2 text-muted-foreground">Browse our current sneaker inventory</p></div></section><section className="mx-auto max-w-7xl px-4 py-10">
    <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6" aria-label="Product filters">
      <label className="lg:col-span-2"><span className="sr-only">Search products</span><input className={`${field} w-full`} value={search} placeholder="Search products" onChange={e=>{setSearch(e.target.value);sync({search:e.target.value})}} /></label>
      <select aria-label="Category" className={field} value={category} onChange={e=>{setCategory(e.target.value);sync({category:e.target.value})}}><option value="">All categories</option>{categories.map(v=><option key={v}>{v}</option>)}</select>
      <select aria-label="Size" className={field} value={size} onChange={e=>{setSize(e.target.value);sync({size:e.target.value})}}><option value="">All sizes</option>{sizes.map(v=><option key={v}>{v}</option>)}</select>
      <select aria-label="Condition" className={field} value={condition} onChange={e=>{setCondition(e.target.value);sync({condition:e.target.value})}}><option value="">All conditions</option>{["like-new","excellent","good","fair"].map(v=><option key={v} value={v}>{v.replace("-"," ")}</option>)}</select>
      <select aria-label="Sort products" className={field} value={sort} onChange={e=>{setSort(e.target.value);sync({sort:e.target.value})}}><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Highest rated</option></select>
    </div><label className="mb-6 flex items-center gap-2 text-sm"><input type="checkbox" checked={availability==="available"} onChange={e=>{const v=e.target.checked?"available":"all";setAvailability(v);sync({availability:v})}} /> In stock only</label>
    <p className="mb-6 text-sm text-muted-foreground" aria-live="polite">Showing {products.length} product{products.length===1?"":"s"}</p>
    {products.length?<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map(p=><ProductCard key={p.id} product={p as any} />)}</div>:<div className="rounded-lg border border-dashed p-12 text-center"><h2 className="font-semibold">No matching products</h2><p className="mt-2 text-sm text-muted-foreground">Try removing one or more filters.</p></div>}
  </section></>;
}
