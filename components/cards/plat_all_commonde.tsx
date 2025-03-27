'use client'
import type { MenuPlat, Plat } from "@/types/types"
import { useEffect, useState } from "react"
import { getPlatById } from "@/apis/plats_api"
import { useRouter } from "next/navigation"

interface PlatAllCMDProps {
  isStartWeek :boolean ;
  date : string ;
  menuPlat :MenuPlat ;
}

export default function PlatAllCMD({ menuPlat ,date,isStartWeek}: PlatAllCMDProps) {

  const router = useRouter()
  const handleClick = () => {
    router.push(`/production/production_plat?platId=${menuPlat.id}date=${date}isStatWeek=${isStartWeek}`)
  }

    const [plat, setPlat] = useState<Plat|null>(null);

      useEffect(() => {
        async function fetchPlats() {
          const data = await getPlatById(menuPlat.id);
          if (data){
            setPlat(data);
          }
        }
        fetchPlats();
      }, []);

  return (
    <div className=" bg-[#F5F7FA]  m-3   grid grid-cols-5 gap-4 p-4 hover:bg-[#F15928] hover:bg-opacity-10 transition-colors cursor-pointer items-center"
    onClick={handleClick}>
    <div className=" relative flex items-center  border-opacity-0 rounded-lg ">
      <div className="flex flex-row  w-full items-center">
        <div className="relative w-14 h-14">
          <img
        src={plat?.photo}
        alt={plat?.nomPlat}
        className="object-cove   rounded-md"
      />
        </div>
        <h3 className="text-sm font-medium text-start line-clamp-2 pl-3">{plat?.nomPlat}</h3>
      </div>
    </div>

    <span>{menuPlat.user1s.reduce((sum, item) => sum + item.quantite, 0) + 
         menuPlat.user2s.reduce((sum, item) => sum + item.quantite, 0) + 
         menuPlat.user3s.reduce((sum, item) => sum + item.quantite, 0)}</span>

<span>{menuPlat.user1s.reduce((sum, item) => sum + item.quantite, 0)}</span>
<span>{menuPlat.user2s.reduce((sum, item) => sum + item.quantite, 0)}</span>
<span>{menuPlat.user3s.reduce((sum, item) => sum + item.quantite, 0)}</span>

</div>
  )
}

