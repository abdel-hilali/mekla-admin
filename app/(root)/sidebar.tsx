"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react"; // Icon for mobile menu toggle

const menuItems = [
  { name: "Tableau de bord", path: "/dashboard", icon: "/logos/dash.png", activeIcon: "/logos/dashS.png" },
  { name: "Plats", path: "/plats", icon: "/logos/plats.png", activeIcon: "/logos/platsS.png" },
  { name: "Menus", path: "/menu", icon: "/logos/menu.png", activeIcon: "/logos/menuS.png" },
  { name: "Production", path: "/production", icon: "/logos/com.png", activeIcon: "/logos/comS.png" },
  { name: "Commondes", path: "/commondes", icon: "/logos/fact.png", activeIcon: "/logos/factS.png" },
  { name: "Nos clients", path: "/clients", icon: "/logos/users.png", activeIcon: "/logos/usersS.png" },
  { name: "Livreurs", path: "/livreurs", icon: "/logos/users.png", activeIcon: "/logos/usersS.png" },
  { name: "Livraison", path: "/livraison", icon: "/logos/liv.png", activeIcon: "/logos/livS.png" },
  //{ name: "Facturation", path: "/facturation", icon: "/logos/fact.png", activeIcon: "/logos/factS.png" },
 // { name: "Paramètres", path: "/parametres", icon: "/logos/set.png", activeIcon: "/logos/setS.png" },
];

export default function SideBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // Mobile menu toggle

  return (
    <aside className={` h-full p-4 transition-all ${isOpen ? "w-64" : "w-16"} md:w-64`}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden block p-2 rounded bg-gray-300 hover:bg-gray-400"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Logo */}
      <div className="flex justify-center my-4">
        <Image src="/logos/meklaLogo.png" alt="Logo" width={isOpen ? 160 : 60} height={isOpen ? 160 : 60} />
      </div>

      {/* Menu List */}
      <ul className="mt-4">
        {menuItems.map(({ name, path, icon, activeIcon }) => {
          const isActive = pathname === path;
          return (
            <li key={path} className="mb-2">
              <Link
                href={path}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all
                  ${isActive ? "bg-[#F1592833] text-[#F15928] font-bold" : "text-gray-700 hover:bg-[#F1592833]"}
                `}
              >
                <Image
                  src={isActive ? activeIcon : icon}
                  alt={name}
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <span className={`${isOpen ? "block" : "hidden"} md:block`}>{name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
