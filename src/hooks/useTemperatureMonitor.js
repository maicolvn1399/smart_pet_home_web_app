import { useState } from 'react'

const MOCK_TEMP_CELSIUS = 27.4
const TEMP_MIN = 0
const TEMP_MAX = 40

function celsiusToFahrenheit(c) {
  return Math.round((c * 9) / 5 + 32)
}

export function tempToProgress(temp, min, max) {
  return Math.min(1, Math.max(0, (temp - min) / (max - min)))
}

export function useTemperatureMonitor() {
  const [unit, setUnit] = useState('C')
  const [fanOn, setFanOn] = useState(false)
  const [scheduleMode, setScheduleMode] = useState('time')
  const [fanOnTime, setFanOnTime] = useState('14:00')
  const [fanOffTime, setFanOffTime] = useState('18:00')
  const [threshold, setThreshold] = useState(28)

  const displayTemp = unit === 'C'
    ? MOCK_TEMP_CELSIUS
    : celsiusToFahrenheit(MOCK_TEMP_CELSIUS)

  const tempColor = MOCK_TEMP_CELSIUS >= 30
    ? 'text-red-500'
    : MOCK_TEMP_CELSIUS >= 25
    ? 'text-amber-500'
    : 'text-brand-dark-blue'

  function toggleFan() {
    setFanOn((prev) => !prev)
  }

  function incrementThreshold() {
    setThreshold((t) => Math.min(40, t + 1))
  }

  function decrementThreshold() {
    setThreshold((t) => Math.max(15, t - 1))
  }

  return {
    unit,
    setUnit,
    fanOn,
    toggleFan,
    scheduleMode,
    setScheduleMode,
    fanOnTime,
    setFanOnTime,
    fanOffTime,
    setFanOffTime,
    threshold,
    incrementThreshold,
    decrementThreshold,
    displayTemp,
    tempColor,
    rawTemp: MOCK_TEMP_CELSIUS,
    tempMin: TEMP_MIN,
    tempMax: TEMP_MAX,
  }
}