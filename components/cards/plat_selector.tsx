import Image from "next/image"

interface AddPlatProps {
  onClick: () => void
  label?: string
}

export default function AddPlat({ onClick, label = "Ajouter un plat" }: AddPlatProps) {
  return (
    <div
      className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#EAF5F3] cursor-pointer hover:bg-[#d9ede9] transition-colors w-60 h-28"
      onClick={onClick}
    >
      <div className="relative w-8 h-8 mb-2">
        <Image src="/logos/add.png" alt="Ajouter" fill />
      </div>
      <span className="text-sm font-medium text-center">{label}</span>
    </div>
  )
}

