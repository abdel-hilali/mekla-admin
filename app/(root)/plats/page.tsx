"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PlatCard from "@/components/cards/plat";
import { Plat } from "@/types/types";
import { getAllPlats } from "@/apis/plats_api";
import AddPlat from "@/components/cards/add_plat";


export default function PlatsPage() {
  const [plats, setPlats] = useState<Plat[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const categories = ["All", "Plats", "Desserts", "Entrées"];

  useEffect(() => {
    async function fetchPlats() {
      const data = await getAllPlats("all");
      setPlats(data);
    }
    fetchPlats();
  }, [showDetailsModal]);

  const handleAddClick = () => {
    setShowDetailsModal(true);
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Nos plats</h1>
        <Button className="bg-[#F15928] text-white rounded-full px-4 py-2 flex items-center gap-2"
        onClick={handleAddClick}>
          <span className="text-xl">+</span> Créer un nouveau plat
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm ${
                selectedCategory === category
                  ? "bg-[#F15928]/20 text-[#F15928]"
                  : "text-gray-600 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="relative">
          <Input
            className="rounded-full bg-white pl-10 pr-4 py-2 w-60"
            placeholder="Recherche"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Image
            src="/logos/search.png"
            alt="Search"
            width={20}
            height={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {plats.map((plat) => (
          <PlatCard key={plat.id} plat={plat} />
        ))}
      </div>

      <AddPlat
        showModal={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  );
}
