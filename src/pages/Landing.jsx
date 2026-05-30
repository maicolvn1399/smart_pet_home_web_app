import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import Fade from 'embla-carousel-fade'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'

// Import logo
import logo from '@/assets/logo/logo.png'

// Desktop images (horizontal)
import pet1 from '@/assets/landing/pet1.jpg'
import pet2 from '@/assets/landing/pet2.jpg'
import pet3 from '@/assets/landing/pet3.jpg'
import pet4 from '@/assets/landing/pet4.jpg'
import pet5 from '@/assets/landing/pet5.jpg'
import pet6 from '@/assets/landing/pet6.jpg'
import pet7 from '@/assets/landing/pet7.jpg'
import pet8 from '@/assets/landing/pet8.jpg'
import pet9 from '@/assets/landing/pet9.jpg'
import pet10 from '@/assets/landing/pet10.jpg'
import pet11 from '@/assets/landing/pet11.jpg'

// Mobile images (vertical)
import pet1m from '@/assets/landing/pet1-mobile.jpg'
import pet2m from '@/assets/landing/pet2-mobile.jpg'
import pet3m from '@/assets/landing/pet3-mobile.jpg'
import pet4m from '@/assets/landing/pet4-mobile.jpg'
import pet5m from '@/assets/landing/pet5-mobile.jpg'
import pet6m from '@/assets/landing/pet6-mobile.jpg'
import pet7m from '@/assets/landing/pet7-mobile.jpg'
import pet8m from '@/assets/landing/pet8-mobile.jpg'
import pet9m from '@/assets/landing/pet9-mobile.jpg'
import pet10m from '@/assets/landing/pet10-mobile.jpg'
import pet11m from '@/assets/landing/pet11-mobile.jpg'

// Paired array — each entry has desktop + mobile version
const allImages = [
  { desktop: pet1, mobile: pet1m },
  { desktop: pet2, mobile: pet2m },
  { desktop: pet3, mobile: pet3m },
  { desktop: pet4, mobile: pet4m },
  { desktop: pet5, mobile: pet5m },
  { desktop: pet6, mobile: pet6m },
  { desktop: pet7, mobile: pet7m },
  { desktop: pet8, mobile: pet8m },
  { desktop: pet9, mobile: pet9m },
  { desktop: pet10, mobile: pet10m },
  { desktop: pet11, mobile: pet11m },
]

// Fisher-Yates shuffle algorithm
function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function Landing() {
  const navigate = useNavigate()
  const [images, setImages] = useState([])
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  )
  const fadePlugin = useRef(Fade())

  useEffect(() => {
    setImages(shuffle(allImages))
  }, [])

  if (images.length === 0) return null

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Carousel fullscreen background */}
      <Carousel
        plugins={[autoplayPlugin.current, fadePlugin.current]}
        opts={{ loop: true }}
        className="absolute inset-0 w-full h-full"
      >
        <CarouselContent className="h-screen ml-0">
          {images.map((pair, index) => (
            <CarouselItem key={index} className="pl-0 h-screen">
              <picture className="w-full h-full block">
                <source media="(max-width: 768px)" srcSet={pair.mobile} />
                <img
                  src={pair.desktop}
                  alt={`Pet ${index + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </picture>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      {/* Content on top */}
      <div className="absolute top-12 md:top-16 left-0 right-0 z-20 flex flex-col items-center text-white text-center px-4">
        <img
          src={logo}
          alt="Smart Pet Home"
          className="w-64 md:w-96 mb-6 drop-shadow-2xl"
        />
        <p className="text-2xl md:text-4xl font-light tracking-wide mb-10 max-w-2xl text-white/95 drop-shadow-lg">
          Smart devices for happier pets
        </p>
        <Button
          size="lg"
          onClick={() => navigate('/login')}
          className="text-lg px-8 py-6"
        >
          Get Started
        </Button>
      </div>
    </div>
  )
}

export default Landing