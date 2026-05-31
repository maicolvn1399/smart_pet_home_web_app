import { useRef, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, PawPrint, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHome } from '@/hooks/useHome'
import { usePet } from '@/context/PetContext'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

import dayAnim from '@/assets/animations/day.json'
import nightAnim from '@/assets/animations/night.json'
import petAnim1 from '@/assets/animations/pet_anim_1.json'
import petAnim2 from '@/assets/animations/pet_anim_2.json'
import petAnim3 from '@/assets/animations/pet_anim_3.json'
import petAnim4 from '@/assets/animations/pet_anim_4.json'
import petAnim5 from '@/assets/animations/pet_anim_5.json'
import petAnim6 from '@/assets/animations/pet_anim_6.json'

const PET_ANIMS = [petAnim1, petAnim2, petAnim3, petAnim4, petAnim5, petAnim6]

function formatAgeCategory(category) {
  const map = {
    puppy: 'Puppy',
    kitten: 'Kitten',
    adult_dog: 'Adult',
    adult_cat: 'Adult',
    senior_dog: 'Senior',
    senior_cat: 'Senior',
  }
  return map[category] ?? category
}

function Home() {
  const { pets } = usePet()
  const navigate = useNavigate()
  const [userName, setUserName] = useState('there')
  const [petAnim] = useState(() => PET_ANIMS[Math.floor(Math.random() * PET_ANIMS.length)])

  const timeAnimRef = useRef(null)
  const petAnimRef = useRef(null)
  const timeAnimInstance = useRef(null)
  const petAnimInstance = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name.split(' ')[0])
      }
    })
  }, [])

  const { period, greeting, time, date, tip } = useHome(userName)
  const timeAnim = period === 'night' ? nightAnim : dayAnim

  // Time-of-day animation
  useEffect(() => {
    let cancelled = false

    import('lottie-web').then(({ default: lottie }) => {
      if (cancelled || !timeAnimRef.current) return

      if (timeAnimInstance.current) {
        timeAnimInstance.current.destroy()
        timeAnimInstance.current = null
      }

      timeAnimInstance.current = lottie.loadAnimation({
        container: timeAnimRef.current,
        animationData: timeAnim,
        renderer: 'svg',
        loop: true,
        autoplay: true,
      })
    })

    return () => {
      cancelled = true
      if (timeAnimInstance.current) {
        timeAnimInstance.current.destroy()
        timeAnimInstance.current = null
      }
    }
  }, [timeAnim])

  // Pet animation
  useEffect(() => {
    let cancelled = false

    import('lottie-web').then(({ default: lottie }) => {
      if (cancelled || !petAnimRef.current) return

      if (petAnimInstance.current) {
        petAnimInstance.current.destroy()
        petAnimInstance.current = null
      }

      petAnimInstance.current = lottie.loadAnimation({
        container: petAnimRef.current,
        animationData: petAnim,
        renderer: 'svg',
        loop: true,
        autoplay: true,
      })
    })

    return () => {
      cancelled = true
      if (petAnimInstance.current) {
        petAnimInstance.current.destroy()
        petAnimInstance.current = null
      }
    }
  }, [petAnim])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">

      {/* Hero row */}
      <div className="flex items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground tracking-wide">
            {time} · {date}
          </p>
          <h1 className="text-4xl font-bold text-brand-dark-blue leading-tight">
            {greeting}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back. Your pets and devices are all looking good.
          </p>
        </div>
        <div ref={timeAnimRef} className="w-24 h-24 flex-shrink-0" />
      </div>

      <div className="border-t border-border" />

      {/* Main section */}
      <div className="flex gap-6 items-start">
        <div ref={petAnimRef} className="w-96 h-96 flex-shrink-0" />

        <div className="flex flex-col gap-4 flex-1">

          {/* Pets registered */}
          <Card>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pets registered</p>
                <p className="text-3xl font-bold text-brand-dark-blue">{pets.length}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/add-pet')}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add pet
                </Button>
                <PawPrint className="text-brand-orange opacity-40 w-8 h-8" />
              </div>
            </CardContent>
          </Card>

          {/* Pet cards */}
          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Your pets
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3 pt-3 flex-wrap">
              {pets.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  No pets yet — add your first one!
                </p>
              ) : (
                pets.map((pet) => (
                  <div key={pet.id} className="flex-1 bg-muted/40 rounded-lg px-3 py-2 min-w-[120px]">
                    <p className="text-sm font-semibold text-brand-dark-blue">{pet.name}</p>
                    <p className="text-xs text-muted-foreground">{pet.breed}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatAgeCategory(pet.age_category)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Tip of the day */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3 items-start">
            <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                Pet tip of the day
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">{tip}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Home