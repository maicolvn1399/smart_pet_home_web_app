import { useEffect, useState } from 'react'

const PET_TIPS = [
  "Dogs need at least 30 minutes of exercise per day to stay healthy and happy.",
  "Fresh water should be available to your pet at all times — change it daily.",
  "Cats feel safer when they have vertical space. A cat tree goes a long way!",
  "Regular vet checkups catch problems early and keep your pet living longer.",
  "Pets thrive on routine. Try to feed them at the same time every day.",
  "Mental stimulation is just as important as physical exercise for dogs.",
  "A clean litter box is essential — cats may avoid a dirty one entirely.",
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

export function useHome(userName) {
  const [now, setNow] = useState(new Date())
  const [tip] = useState(() => PET_TIPS[Math.floor(Math.random() * PET_TIPS.length)])

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const period = getPeriod(now.getHours())

  return {
    period,
    greeting: getGreeting(period, userName),
    time: formatTime(now),
    date: formatDate(now),
    tip,
  }
}