'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PlatUser, Profile } from "@/types/types"
import { getProfileDetailsById } from "@/apis/auth"
import { getActiviteSportif } from "@/lib/utils"

interface PlatUserCMDProps {
  platUser :PlatUser
   isStartWeek :boolean ;
    date : string ;
}

export default function PlatUserCMD({ platUser,date,isStartWeek }: PlatUserCMDProps) {

  const router = useRouter()
  const handleClickDetails = () => {
    router.push(`/production/production_plat?platId=${platUser.id}date=${date}isStatWeek=${isStartWeek}`)
  }

    const [user, setUser] = useState<Profile|null>(null);

      useEffect(() => {
        async function fetchPlats() {
          const data = await getProfileDetailsById(platUser.id);
          if (data){
            setUser(data);
          }
        }
        fetchPlats();
      }, []);

  return (
    <div className=" bg-[#F5F7FA]  m-3   grid grid-cols-6 gap-4 p-4 hover:bg-[#F15928] hover:bg-opacity-10 transition-colors   items-center">
    <div className=" relative flex items-center  border-opacity-0 rounded-lg ">
      <div className="flex flex-row items-center w-full">
        <div className="relative w-14 h-14 ">
          <img
        src={user?.picture ?? '/images/unkown.JPEG'}
        alt={user?.name}
        className="object-cover h-full w-full  rounded-full"
      />
        </div>
        <div className="w-full flex flex-col justify-center">
        <h3 className="text-sm font-medium text-start line-clamp-2 pl-3">{user?.firstName}</h3>
            <h3 className="text-sm font-medium text-start line-clamp-2 pl-3">{user?.name}</h3>
        </div>
      </div>
    </div>

    <span>{platUser.quantite}</span>
    <span>{getActiviteSportif(user?.type)}</span>
    <span>{user?.allergies !="" ?user?.allergies :"Aucune"}</span>
    <span>{user?.phone}</span>
    <span
        className="text-[#F15928] underline hover:cursor-pointer flex items-center gap-1"
        onClick={handleClickDetails}
        >
        Voir plus <span className="text-[#F15928] text-lg">→</span>
    </span>

</div>
  )
}

