import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { useResetPassword } from '@/hooks/useAuth'
import logo from '@/assets/logo/logo_navbar.png'

export default function ResetPassword() {
  const {
    password, setPassword,
    confirmPassword, setConfirmPassword,
    error,
    loading,
    success,
    handleUpdatePassword,
  } = useResetPassword()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-6 flex flex-col gap-5">

          <div className="flex flex-col items-center gap-2">
            <img src={logo} alt="Smart Pet Home" className="h-10 w-auto" />
            <h1 className="text-xl font-bold text-brand-dark-blue">
              {success ? 'Password updated' : 'Set a new password'}
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              {success
                ? 'Redirecting you to login...'
                : 'Choose a new password for your account.'}
            </p>
          </div>

          {!success ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-xs text-destructive text-center">{error}</p>
              )}

              <Button
                className="w-full"
                onClick={handleUpdatePassword}
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? 'Updating...' : 'Update password'}
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="w-12 h-12 text-brand-orange" />
              <p className="text-sm text-center text-muted-foreground">
                Your password has been changed successfully.
              </p>
            </div>
          )}

          {!success && (
            <p className="text-xs text-center text-muted-foreground">
              <Link to="/login" className="text-brand-orange hover:underline font-medium">
                Back to login
              </Link>
            </p>
          )}

        </CardContent>
      </Card>
    </div>
  )
}