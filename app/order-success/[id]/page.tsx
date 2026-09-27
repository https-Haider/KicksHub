import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";
import { getOrderById } from "@/lib/orders.server";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;const order=await getOrderById(id);if(!order)notFound();const paid=order.paymentStatus==="paid";return <main className="flex min-h-screen items-center justify-center p-6"><div className="max-w-lg text-center">{paid?<CheckCircle className="mx-auto mb-6 h-20 w-20 text-green-500"/>:<Clock className="mx-auto mb-6 h-20 w-20 text-amber-500"/>}<h1 className="text-3xl font-bold">{paid?"Payment confirmed":"Payment is processing"}</h1><p className="mt-4 text-muted-foreground">Order <span className="font-mono font-semibold text-foreground">{order.id}</span> {paid?"has been paid.":"will be confirmed after Stripe verifies the payment."}</p><Button asChild className="mt-8"><Link href="/products">Continue shopping</Link></Button></div></main>}
