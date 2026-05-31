import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, PawPrint } from 'lucide-react'

import dayAnim from '@/assets/animations/day.json'
import nightAnim from '@/assets/animations/night.json'
import petAnim1 from '@/assets/animations/pet_anim_1.json'
import petAnim2 from '@/assets/animations/pet_anim_2.json'
import petAnim3 from '@/assets/animations/pet_anim_3.json'
import petAnim4 from '@/assets/animations/pet_anim_4.json'
import petAnim5 from '@/assets/animations/pet_anim_5.json'
import petAnim6 from '@/assets/animations/pet_anim_6.json'
import petAnim7 from '@/assets/animations/pet_anim_7.json'
import petAnim8 from '@/assets/animations/pet_anim_8.json'
import petAnim9 from '@/assets/animations/pet_anim_9.json'

const PET_ANIMS = [petAnim1, petAnim2, petAnim3, petAnim4, petAnim5, petAnim6, petAnim7, petAnim8, petAnim9]

const PET_TIPS = [
  "Dogs need at least 30 minutes of exercise per day to stay healthy and happy.",
  "Fresh water should be available to your pet at all times, change it daily.",
  "Cats feel safer when they have vertical space. A cat tree goes a long way!",
  "Regular vet checkups catch problems early and keep your pet living longer.",
  "Pets thrive on routine. Try to feed them at the same time every day.",
  "Mental stimulation is just as important as physical exercise for dogs.",
  "A clean litter box is essential, cats may avoid a dirty one entirely.",
  "Short, positive training sessions work better than long ones for dogs.",
]

function getPeriod(hour) {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'night'
}

function getGreeting(period, name) {
  if (period === 'morning') return `Good morning, ${name}!`
  if (period === 'afternoon') return `Good afternoon, ${name}!`
  return `Good night, ${name}!`
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(date) {
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
}

// TODO: replace with real pets from Supabase
const PLACEHOLDER_PETS = [
  { name: 'Buddy', breed: 'Golden Retriever', age: 3 },
  { name: 'Luna', breed: 'Siamese Cat', age: 1 },
]

// TODO: replace with real user from supabase.auth.getUser()
const USER_NAME = 'Michael'

function Home() {
  const [now, setNow] = useState(new Date())
  const [petAnim] = useState(() => PET_ANIMS[Math.floor(Math.random() * PET_ANIMS.length)])
  const [tip] = useState(() => PET_TIPS[Math.floor(Math.random() * PET_TIPS.length)])

  const timeAnimRef = useRef(null)
  const petAnimRef = useRef(null)
  const timeAnimInstance = useRef(null)
  const petAnimInstance = useRef(null)

  const period = getPeriod(now.getHours())
  const timeAnim = period === 'night' ? nightAnim : dayAnim

  // Clock tick
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Time-of-day animation
  useEffect(() => {
    let cancelled = false

    import('lottie-web').then(({ default: lottie }) => {
      if (cancelled || !timeAnimRef.current) return

      // Destroy previous instance if it exists
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
            {formatTime(now)} · {formatDate(now)}
          </p>
          <h1 className="text-4xl font-bold text-brand-dark-blue leading-tight">
            {getGreeting(period, USER_NAME)}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back. Your pets and devices are all looking good.
          </p>
        </div>

        {/* Time-of-day animation — single instance */}
        <div ref={timeAnimRef} className="w-24 h-24 flex-shrink-0" />
      </div>

      <div className="border-t border-border" />

      {/* Main section */}
      <div className="flex gap-6 items-start">

        {/* Pet animation — single instance, bigger */}
        <div ref={petAnimRef} className="w-64 h-64 flex-shrink-0" />

        {/* Right column */}
        <div className="flex flex-col gap-4 flex-1">

          <Card>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pets registered</p>
                <p className="text-3xl font-bold text-brand-dark-blue">{PLACEHOLDER_PETS.length}</p>
              </div>
              <PawPrint className="text-brand-orange opacity-40 w-8 h-8" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Your pets
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3 pt-3">
              {PLACEHOLDER_PETS.map((pet) => (
                <div key={pet.name} className="flex-1 bg-muted/40 rounded-lg px-3 py-2">
                  <p className="text-sm font-semibold text-brand-dark-blue">{pet.name}</p>
                  <p className="text-xs text-muted-foreground">{pet.breed}</p>
                  <p className="text-xs text-muted-foreground">
                    {pet.age} {pet.age === 1 ? 'year' : 'years'} old
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

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