import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
          </div>
          <Button className="w-full" onClick={() => navigate('/home')}>
            Login
          </Button>
        </CardContent>
        <CardContent className="space-y-2">
          <div className="space-y-2">
            <Label>Don't have an account?</Label>
          </div>
          <Button className="w-fit" onClick={() => navigate('/registration')}>
            Register
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}

export default Login