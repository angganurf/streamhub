"use client";

import Link from "next/link";
import { Search, Menu, Upload, User, Video, Camera, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { CategoryMegaMenu } from "./category-menu";

export function Header() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "VIDEOS", href: "#videos" },
    { name: "CATEGORIES", href: "#categories" },
    { name: "LIVE CAMS", href: "#live" },
    { name: "CREATORS", href: "#creators" },
    { name: "COMMUNITY", href: "#community" },
    { name: "PHOTOS & GIFS", href: "#photos" },
  ];

  return (
    <header className="w-full bg-black text-white flex flex-col font-sans">
      {/* Tier 1: Micro Navigation */}
      <div className="hidden md:flex justify-center items-center gap-6 h-8 text-[11px] font-bold text-gray-400 tracking-wider">
        <Link href="#" className="hover:text-white transition-colors">NETWORK</Link>
        <Link href="#" className="hover:text-white transition-colors">WELLNESS</Link>
        <Link href="#" className="hover:text-white transition-colors">INSIGHTS</Link>
        <Link href="#" className="hover:text-white transition-colors">PARTNERS</Link>
        <Link href="#" className="hover:text-white transition-colors">SHOP</Link>
        <Link href="#" className="hover:text-white transition-colors">TRUST & SAFETY</Link>
        <Link href="#" className="hover:text-white transition-colors">EN</Link>
      </div>

      {/* Tier 2: Main Header */}
      <div className="flex h-16 items-center px-4 md:px-6 max-w-[1600px] mx-auto w-full">
        {/* Left: Hamburger & Logo */}
        <div className="flex items-center gap-3 md:gap-5 flex-1 justify-start">
          <Sheet>
            <SheetTrigger render={
              <button type="button" className="text-gray-300 hover:text-white transition-colors">
                <Menu className="h-7 w-7" />
                <span className="sr-only">Toggle menu</span>
              </button>
            } />
            <SheetContent side="left" className="w-[260px] bg-[#1a1a1a] border-none text-white p-0">
              <div className="h-16 flex items-center px-4 border-b border-[#333]">
                <Link href="/" className="flex items-center text-xl font-bold tracking-tight">
                  <span>Stream</span>
                  <span className="bg-[#ffa31a] text-black px-1.5 py-0.5 rounded-md ml-1">Hub</span>
                </Link>
              </div>
              <div className="h-[calc(100vh-4rem)]">
                <Sidebar />
              </div>
            </SheetContent>
          </Sheet>
          
          <Link href="/" className="flex items-center text-2xl font-bold tracking-tight select-none">
            <span>Stream</span>
            <span className="bg-[#ffa31a] text-black px-1.5 py-0.5 rounded-md ml-1 leading-none pb-1">Hub</span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 items-center justify-center max-w-2xl px-4 w-full">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              type="search" 
              placeholder="Search Streamhub" 
              className="w-full pl-12 h-11 bg-[#2b2b2b] hover:bg-[#333] border-transparent text-white focus-visible:ring-1 focus-visible:ring-[#ffa31a] focus-visible:border-transparent rounded-full text-base transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 md:hidden flex justify-end" /> {/* Spacer for mobile */}

        {/* Right Actions */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <Button variant="ghost" size="icon" className="md:hidden text-gray-300 hover:text-white">
            <Search className="h-6 w-6" />
          </Button>

          <Link href="/admin/videos/create" className="hidden sm:block">
            <Button className="bg-[#ffa31a] hover:bg-[#ffb03a] text-black font-bold h-9 px-4 rounded-full text-xs tracking-wider">
              UPLOAD
            </Button>
          </Link>

          <div className="hidden sm:flex items-center gap-3 text-gray-300">
            <button className="hover:text-white transition-colors"><Video className="h-6 w-6" /></button>
            <button className="hover:text-white transition-colors"><Camera className="h-6 w-6" /></button>
          </div>

          {isPending ? (
            <div className="h-8 w-8 rounded-full bg-gray-800 animate-pulse" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button type="button" className="h-8 w-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
                  <User className="h-5 w-5 text-gray-300" />
                </button>
              } />
              <DropdownMenuContent align="end" className="w-48 bg-[#1a1a1a] border-[#333] text-white">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-bold">{session.user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-[#333]" />
                <DropdownMenuItem onClick={() => router.push("/admin")} className="focus:bg-[#333] focus:text-white font-bold text-sm cursor-pointer">
                  Admin Panel
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#333]" />
                <DropdownMenuItem onClick={handleLogout} className="focus:bg-red-900 focus:text-white font-bold text-sm text-red-500 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <button type="button" className="h-8 w-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
                <User className="h-5 w-5 text-gray-300" />
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Tier 3: Sub Navigation */}
      <div className="hidden md:flex border-b border-[#333] bg-black relative">
        <nav className="flex items-center justify-center max-w-[1600px] mx-auto w-full px-4 text-xs font-bold tracking-widest text-gray-400 overflow-x-auto no-scrollbar">
          {navLinks.map((link) => {
            if (link.name === "CATEGORIES") {
              return (
                <CategoryMegaMenu key={link.name} isActive={pathname === link.href}>
                  {link.name}
                </CategoryMegaMenu>
              );
            }
            
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`whitespace-nowrap px-4 py-3 hover:text-white transition-colors border-b-2 ${
                  pathname === link.href || (pathname === '/' && link.href === '/') 
                    ? "border-[#ffa31a] text-white" 
                    : "border-transparent"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
