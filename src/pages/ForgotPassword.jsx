import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, CheckCircle2 } from 'lucide-react'
import { useForgotPassword } from '@/hooks/useAuth'
import logo from '@/assets/logo/logo_navbar.png'

export default function ForgotPassword() {
  const {
    email,
    setEmail,
    error,
    loading,
    sent,
    handleSendRecovery,
  } = useForgotPassword()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-6 flex flex-col gap-5">

          <div className="flex flex-col items-center gap-2">
            <img src={logo} alt="Smart Pet Home" className="h-10 w-auto" />
            <h1 className="text-xl font-bold text-brand-dark-blue">
              {sent ? 'Check your inbox' : 'Forgot your password?'}
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              {sent
                ? 'We sent you a recovery link. Click it to set a new password.'
                : 'Enter your email and we\'ll send you a link to reset it.'}
            </p>
          </div>

          {!sent ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-xs text-destructive text-center">{error}</p>
              )}

              <Button
                className="w-full"
                onClick={handleSendRecovery}
                disabled={loading || !email}
              >
                <Mail className="w-4 h-4 mr-2" />
                {loading ? 'Sending...' : 'Send recovery link'}
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="w-12 h-12 text-brand-orange" />
              <p className="text-sm text-center text-muted-foreground">
                Email sent to <span className="font-medium text-foreground">{email}</span>
              </p>
              <p className="text-xs text-center text-muted-foreground">
                Didn't receive it? Check your spam folder.
              </p>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Remembered it?{' '}
            <Link to="/login" className="text-brand-orange hover:underline font-medium">
              Back to login
            </Link>
          </p>

        </CardContent>
      </Card>
    </div>
  )
}