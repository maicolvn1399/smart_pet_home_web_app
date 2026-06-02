import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { usePet } from '@/context/PetContext'

export function useSettings() {
  const { pets, refetchPets } = usePet()
  const fileInputRef = useRef(null)

  // Profile state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI state
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState('')
  const [deleteAccountMode, setDeleteAccountMode] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Devices state
  const [devicesByPet, setDevicesByPet] = useState({})
  const [loadingDevices, setLoadingDevices] = useState(true)
  const [deletingDeviceId, setDeletingDeviceId] = useState(null)

  useEffect(() => {
    loadProfile()
    loadDevices()
  }, [])

  async function loadProfile() {
    setLoadingProfile(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setEmail(user.email)

    const { data } = await supabase
      .from('users')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()

    if (data) {
      setFullName(data.full_name ?? '')
      setAvatarUrl(data.avatar_url ?? '')
    }

    setLoadingProfile(false)
  }

  async function loadDevices() {
    setLoadingDevices(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: devices } = await supabase
      .from('devices')
      .select('id, serial_number, type, name, status, pet_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (devices) {
      const grouped = {}
      pets.forEach((pet) => {
        grouped[pet.id] = {
          pet,
          devices: devices.filter((d) => d.pet_id === pet.id),
        }
      })
      setDevicesByPet(grouped)
    }

    setLoadingDevices(false)
  }

  async function handleSaveProfile() {
    setSavingProfile(true)
    setProfileError('')
    setProfileSuccess('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Update full name in users table
    const { error: nameError } = await supabase
      .from('users')
      .update({ full_name: fullName.trim() })
      .eq('id', user.id)

    if (nameError) {
      setProfileError(nameError.message)
      setSavingProfile(false)
      return
    }

    // Update email in auth if changed
    if (email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email })
      if (emailError) {
        setProfileError(emailError.message)
        setSavingProfile(false)
        return
      }
    }

    setSavingProfile(false)
    setProfileSuccess('Profile updated!')
    setTimeout(() => setProfileSuccess(''), 3000)
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    setProfileError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fileExt = file.name.split('.').pop()
    const filePath = `avatars/${user.id}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('pet-photos')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setProfileError(uploadError.message)
      setUploadingAvatar(false)
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
    setUploadingAvatar(false)
    setProfileSuccess('Avatar updated!')
    setTimeout(() => setProfileSuccess(''), 3000)
  }

  async function handleChangePassword() {
    setPasswordError('')
    setPasswordSuccess('')

    if (!newPassword) {
      setPasswordError('Please enter a new password.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setSavingPassword(true)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError(error.message)
      setSavingPassword(false)
      return
    }

    setNewPassword('')
    setConfirmPassword('')
    setSavingPassword(false)
    setPasswordSuccess('Password changed!')
    setTimeout(() => setPasswordSuccess(''), 3000)
  }

  async function handleDeleteDevice(deviceId) {
    setDeletingDeviceId(deviceId)

    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('id', deviceId)

    if (!error) {
      await loadDevices()
    }

    setDeletingDeviceId(null)
  }

  async function handleDeleteAccount() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (deleteAccountConfirm !== fullName) {
      setProfileError(`Type "${fullName}" to confirm deletion.`)
      return
    }

    setDeletingAccount(true)

    // Delete user data
    await supabase.from('users').delete().eq('id', user.id)

    // Sign out
    await supabase.auth.signOut()

    window.location.href = '/'
  }

  return {
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
  }
}