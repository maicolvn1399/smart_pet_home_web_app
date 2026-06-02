import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Upload, Trash2, User, Lock, Cpu, AlertTriangle } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-brand-dark-blue/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-brand-dark-blue" />
      </div>
      <h2 className="text-base font-semibold text-brand-dark-blue">{title}</h2>
    </div>
  )
}

function DeviceTypeBadge({ type }) {
  const map = {
    kibble_dispenser: { label: 'KBL', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    temperature_monitor: { label: 'TMP', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    pet_door: { label: 'DOR', color: 'bg-green-50 text-green-700 border-green-200' },
    voice_communication: { label: 'VOC', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    water_dispenser: { label: 'WTR', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    treat_dispenser: { label: 'TRT', color: 'bg-pink-50 text-pink-700 border-pink-200' },
    ball_launcher: { label: 'BAL', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    movement_detector: { label: 'MOV', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  }
  const { label, color } = map[type] ?? { label: type, color: '' }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${color}`}>
      {label}
    </span>
  )
}

export default function Settings() {
  const {
    fileInputRef,
    fullName, setFullName,
    email, setEmail,
    avatarUrl,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    loadingProfile,
    savingProfile,
    savingPassword,
    uploadingAvatar,
    deletingAccount,
    deleteAccountConfirm, setDeleteAccountConfirm,
    deleteAccountMode, setDeleteAccountMode,
    profileError, setProfileError,
    profileSuccess,
    passwordError,
    passwordSuccess,
    devicesByPet,
    loadingDevices,
    deletingDeviceId,
    handleSaveProfile,
    handleAvatarUpload,
    handleChangePassword,
    handleDeleteDevice,
    handleDeleteAccount,
  } = useSettings()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">

      <div>
        <h1 className="text-3xl font-bold text-brand-dark-blue">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your account and devices</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader className="border-b pb-4">
          <SectionHeader icon={User} title="Profile" />
        </CardHeader>
        <CardContent className="pt-6 flex flex-col gap-5">

          {loadingProfile ? (
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          ) : (
            <>
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  <AvatarImage src={avatarUrl} alt="Avatar" />
                  <AvatarFallback className="bg-brand-orange text-white text-lg">
                    {fullName?.slice(0, 1).toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                  >
                    <Upload className="w-3.5 h-3.5 mr-2" />
                    {uploadingAvatar ? 'Uploading...' : 'Upload new photo'}
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF — max 5MB</p>
                </div>
              </div>

              {/* Full name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Changing your email will require re-verification.
                </p>
              </div>

              {profileError && <p className="text-xs text-destructive">{profileError}</p>}
              {profileSuccess && <p className="text-xs text-green-600">{profileSuccess}</p>}

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save profile'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader className="border-b pb-4">
          <SectionHeader icon={Lock} title="Change password" />
        </CardHeader>
        <CardContent className="pt-6 flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your new password"
            />
          </div>

          {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
          {passwordSuccess && <p className="text-xs text-green-600">{passwordSuccess}</p>}

          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={savingPassword}>
              {savingPassword ? 'Changing...' : 'Change password'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Devices */}
      <Card>
        <CardHeader className="border-b pb-4">
          <SectionHeader icon={Cpu} title="Devices" />
        </CardHeader>
        <CardContent className="pt-6">
          {loadingDevices ? (
            <p className="text-sm text-muted-foreground">Loading devices...</p>
          ) : Object.keys(devicesByPet).length === 0 ? (
            <p className="text-sm text-muted-foreground">No devices found.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {Object.values(devicesByPet).map(({ pet, devices }) => (
                <div key={pet.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar size="sm">
                      <AvatarImage src={pet.profile_pic_url ?? ''} alt={pet.name} />
                      <AvatarFallback className="bg-brand-medium-blue text-white text-xs">
                        {pet.name.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">{pet.name}</span>
                    <span className="text-xs text-muted-foreground">({devices.length} device{devices.length !== 1 ? 's' : ''})</span>
                  </div>

                  {devices.length === 0 ? (
                    <p className="text-xs text-muted-foreground pl-8">No devices linked to {pet.name}.</p>
                  ) : (
                    <div className="flex flex-col gap-2 pl-2">
                      {devices.map((device) => (
                        <div
                          key={device.id}
                          className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-muted/30"
                        >
                          <div className="flex items-center gap-3">
                            <DeviceTypeBadge type={device.type} />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {device.name ?? device.serial_number}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {device.serial_number}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-medium ${
                              device.status === 'online' ? 'text-green-600' : 'text-muted-foreground'
                            }`}>
                              {device.status}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteDevice(device.id)}
                              disabled={deletingDeviceId === device.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader className="border-b border-destructive/20 pb-4">
          <SectionHeader icon={AlertTriangle} title="Danger zone" />
        </CardHeader>
        <CardContent className="pt-6">
          {!deleteAccountMode ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Delete account</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteAccountMode(true)}
              >
                Delete account
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm font-medium text-red-700 mb-1">
                  This action is irreversible
                </p>
                <p className="text-xs text-red-600">
                  All your pets, devices, configurations and data will be permanently deleted.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deleteConfirm">
                  Type <span className="font-semibold">{fullName}</span> to confirm
                </Label>
                <Input
                  id="deleteConfirm"
                  placeholder={fullName}
                  value={deleteAccountConfirm}
                  onChange={(e) => { setDeleteAccountConfirm(e.target.value); setProfileError('') }}
                />
              </div>
              {profileError && <p className="text-xs text-destructive">{profileError}</p>}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => { setDeleteAccountMode(false); setDeleteAccountConfirm('') }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount || deleteAccountConfirm !== fullName}
                >
                  {deletingAccount ? 'Deleting...' : 'Delete permanently'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}