import React from "react";
import Image from "next/image";
import { Plat } from "@/types/types";

interface PlatCardProps {
  plat: Plat;
}

const PlatCard: React.FC<PlatCardProps> = ({ plat }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <img
        src={plat.photo}
        alt={plat.nomPlat}
        width={300}
        height={200}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold">{plat.nomPlat}</h2>
        <p className="text-sm text-gray-500">{plat.description}</p>
        <p className="text-xs text-gray-400 mt-2">{plat.ingredient}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {plat.typePlat.replace("PLAT_", "")}
          </span>
          {plat.platCalories && (
            <span className="text-sm font-semibold">{plat.platCalories} kcal</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatCard;
