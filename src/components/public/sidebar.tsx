"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  PlaySquare, 
  Zap, 
  ThumbsUp, 
  Flame, 
  Star, 
  Users,
  User, 
  Tv, 
  Library,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { getSidebarCategories } from "@/actions/categories";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [creatorsExpanded, setCreatorsExpanded] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getSidebarCategories();
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    }
    load();
  }, []);

  const menuItems = [
    { name: "Featured Videos", icon: PlaySquare, href: "/featured" },
    { name: "Shorties", icon: Zap, href: "/shorties" },
    { name: "Recommended Videos", icon: ThumbsUp, href: "/recommended" },
    { name: "Trending Locally", icon: Flame, href: "/trending" },
  ];

  const genderItems = [
    { name: "Straight", icon: Users, href: "/category/straight" },
    { name: "Gay", icon: Users, href: "/category/gay" },
    { name: "Lesbian", icon: Users, href: "/category/lesbian" },
    { name: "Trans", icon: User, href: "/category/trans" },
  ];

  const NavItem = ({ name, icon: Icon, href, isActive, onClick, rightIcon: RightIcon }: any) => (
    <Link 
      href={href} 
      onClick={onClick}
      className={`relative flex items-center justify-between px-4 py-3 rounded-lg transition-colors group
        ${isActive ? 'bg-[#333]' : 'hover:bg-[#333]'}
      `}
    >
      <div className="flex items-center gap-4">
        <Icon className="h-5 w-5 text-gray-300 group-hover:text-white" />
        <span className="text-[14px] font-bold text-gray-200 group-hover:text-white tracking-wide">
          {name}
        </span>
      </div>
      {RightIcon && <RightIcon className="h-4 w-4 text-gray-400" />}
      {isActive && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#ffa31a] rounded-l-md" />
      )}
    </Link>
  );

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-white overflow-y-auto no-scrollbar custom-scrollbar px-3 py-4 gap-1">
      {/* Top Menu */}
      {menuItems.map((item) => (
        <NavItem 
          key={item.name}
          name={item.name}
          icon={item.icon}
          href={item.href}
          isActive={pathname === item.href}
        />
      ))}

      {/* Creators Accordion */}
      <button 
        onClick={() => setCreatorsExpanded(!creatorsExpanded)}
        className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-[#333] transition-colors mt-2"
      >
        <div className="flex items-center gap-4">
          <Star className="h-5 w-5 text-gray-300" />
          <span className="text-[14px] font-bold text-gray-200 tracking-wide">Creators & Models</span>
        </div>
        {creatorsExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {/* Gender items */}
      <div className="mt-2 flex flex-col gap-1">
        {genderItems.map((item) => (
          <NavItem 
            key={item.name}
            name={item.name}
            icon={item.icon}
            href={item.href}
            isActive={pathname === item.href}
          />
        ))}
      </div>

      <div className="mt-2">
        <NavItem name="Channels" icon={Tv} href="/channels" isActive={pathname === "/channels"} />
      </div>

      {/* Top Categories Accordion */}
      <button 
        onClick={() => setCategoriesExpanded(!categoriesExpanded)}
        className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-[#333] transition-colors mt-2"
      >
        <div className="flex items-center gap-4">
          <Library className="h-5 w-5 text-gray-300" />
          <span className="text-[14px] font-bold text-gray-200 tracking-wide">Top Categories</span>
        </div>
        {categoriesExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {categoriesExpanded && (
        <div className="flex flex-col gap-1 pl-4 mt-1 border-l border-[#333] ml-6">
          {categories.map((cat) => (
            <Link 
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={`px-4 py-2 text-[13px] font-bold tracking-wide rounded-md transition-colors
                ${pathname === `/category/${cat.slug}` ? 'text-white bg-[#333]' : 'text-gray-400 hover:text-white hover:bg-[#333]'}
              `}
            >
              {cat.name}
            </Link>
          ))}
          {categories.length === 0 && (
            <span className="px-4 py-2 text-[13px] text-gray-500 italic">No categories</span>
          )}
        </div>
      )}
    </div>
  );
}
