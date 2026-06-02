import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import logo from '@/assets/logo/logo_navbar.png'

export default function ProfilePhoto() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [fullName, setFullName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        setFullName(user.user_metadata.full_name.split(' ')[0])
      }
    })
  }, [])

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fileExt = file.name.split('.').pop()
    const filePath = `avatars/${user.id}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('pet-photos')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('pet-photos')
      .getPublicUrl(filePath)

    await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    setAvatarUrl(publicUrl)
    setUploading(false)
  }

  function handleContinue() {
    navigate('/add-pet')
  }

  function handleSkip() {
    navigate('/add-pet')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-6 flex flex-col items-center gap-6">

          <img src={logo} alt="Smart Pet Home" className="h-10 w-auto" />

          <div className="text-center">
            <h1 className="text-xl font-bold text-brand-dark-blue">
              Hi {fullName}! Add a profile photo
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
                You can always change this later.
            </p>
          </div>

          {/* Avatar preview */}
          <div className="relative">
            <Avatar className="w-28 h-28">
              <AvatarImage src={avatarUrl} alt="Profile photo" />
              <AvatarFallback className="bg-brand-orange text-white text-4xl">
                {fullName?.slice(0, 1).toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            {avatarUrl && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>

          {/* Upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : avatarUrl ? 'Change photo' : 'Upload a photo'}
          </Button>

          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}

          {/* Continue button — only shows after uploading */}
          {avatarUrl && (
            <Button className="w-full" onClick={handleContinue}>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {/* Skip */}
          <button
            onClick={handleSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Skip for now
          </button>

        </CardContent>
      </Card>
    </div>
  )
}