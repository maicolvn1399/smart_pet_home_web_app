import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function PetCard({ pet, onClick }) {
  return (
    <div
      onClick={() => onClick(pet)}
      className="flex flex-col items-center gap-2 bg-muted/40 hover:bg-muted/60 rounded-xl px-4 py-3 cursor-pointer transition-colors min-w-[120px] flex-1"
    >
      <Avatar size="lg">
        <AvatarImage src={pet.profile_pic_url ?? ''} alt={pet.name} />
        <AvatarFallback className="bg-brand-medium-blue text-white text-lg">
          {pet.name.slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="text-center">
        <p className="text-sm font-semibold text-brand-dark-blue">{pet.name}</p>
        <p className="text-xs text-muted-foreground capitalize">{pet.type}</p>
      </div>
    </div>
  )
}