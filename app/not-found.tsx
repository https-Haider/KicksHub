import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound(){return <main className="flex min-h-screen items-center justify-center px-4 text-center"><div><p className="font-semibold text-primary">404</p><h1 className="mt-2 text-4xl font-bold">Page not found</h1><p className="mt-3 text-muted-foreground">The page you requested does not exist.</p><Button asChild className="mt-6"><Link href="/">Return home</Link></Button></div></main>}
