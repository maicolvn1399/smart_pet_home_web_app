import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-4">Smart Pet Home v2</h1>
      <p className="text-gray-500 mb-8">The smart way to care for your pet</p>
      <Button onClick={() => navigate('/login')} size="lg">
        Get Started
      </Button>
    </div>
  )
}

export default Landing