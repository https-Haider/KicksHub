import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  RefreshCw,
  Heart,
  Award,
  Users,
  Target,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "About Us | KicksHub - Premium Thrift Sneakers",
  description:
    "Learn about KicksHub, Pakistan's trusted destination for authentic pre-owned sneakers. Quality verified, affordable prices, and a passion for kicks.",
};

export default function AboutPage() {
  const stats = [
    { label: "Happy Customers", value: "5,000+" },
    { label: "Sneakers Sold", value: "10,000+" },
    { label: "Brands Available", value: "50+" },
    { label: "Years in Business", value: "3+" },
  ];

  const values = [
    {
      icon: ShieldCheck,
      title: "Authenticity Guaranteed",
      description:
        "Every sneaker is carefully inspected and verified for authenticity before listing.",
    },
    {
      icon: Heart,
      title: "Passion for Kicks",
      description:
        "We're sneakerheads ourselves. We understand the love for authentic, quality footwear.",
    },
    {
      icon: RefreshCw,
      title: "Sustainable Fashion",
      description:
        "Give sneakers a second life. Reduce waste while looking fresh.",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description:
        "Quick and secure shipping across Pakistan with real-time tracking.",
    },
  ];

  const team = [
    {
      name: "Ahmed Khan",
      role: "Founder & CEO",
      bio: "Sneaker enthusiast since 2010. Started KicksHub to make authentic kicks accessible to everyone.",
    },
    {
      name: "Sara Ali",
      role: "Head of Authentication",
      bio: "Expert in sneaker verification with 5+ years of experience in the industry.",
    },
    {
      name: "Usman Malik",
      role: "Operations Manager",
      bio: "Ensures every order is processed and delivered with care and efficiency.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <Link href="/" className="text-2xl font-bold">
              KicksHub
            </Link>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About KicksHub
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Pakistan&apos;s premier destination for authentic pre-owned
              sneakers. We believe everyone deserves to rock genuine kicks
              without breaking the bank.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 text-primary mb-4">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">Our Story</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  From Passion to Platform
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    KicksHub started in 2021 with a simple idea: make authentic
                    sneakers accessible to everyone in Pakistan. As sneaker
                    enthusiasts ourselves, we knew the struggle of finding
                    genuine kicks at reasonable prices.
                  </p>
                  <p>
                    What began as selling from our personal collection has grown
                    into Pakistan&apos;s most trusted thrift sneaker
                    marketplace. We carefully source, verify, and curate each
                    pair to ensure our customers get nothing but the best.
                  </p>
                  <p>
                    Today, we&apos;ve helped thousands of sneakerheads find
                    their perfect pair. From rare Jordans to classic Air Force
                    1s, we bring the heat to your doorstep.
                  </p>
                </div>
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Award className="h-24 w-24 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Since 2021</h3>
                    <p className="text-muted-foreground">
                      Serving sneaker lovers across Pakistan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 text-primary mb-4">
                <Target className="h-5 w-5" />
                <span className="font-semibold">Our Values</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Sets Us Apart
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We&apos;re not just another sneaker store. We&apos;re a
                community built on trust, quality, and a shared love for kicks.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <Card key={value.title} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 text-primary mb-4">
                <Users className="h-5 w-5" />
                <span className="font-semibold">Our Team</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Meet the Sneakerheads
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The passionate team behind KicksHub, dedicated to bringing you
                the best sneakers.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {team.map((member) => (
                <Card key={member.name}>
                  <CardContent className="pt-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-muted-foreground">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-primary text-sm mb-3">{member.role}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Find Your Perfect Pair?
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Browse our collection of authentic pre-owned sneakers and discover
              your next grail at unbeatable prices.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/products">Browse Collection</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} KicksHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
