import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Upload, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { usePetEdit } from '@/hooks/usePetEdit'
import {
  DOG_AGE_OPTIONS,
  CAT_AGE_OPTIONS,
  COAT_TYPE_OPTIONS,
  SIZE_OPTIONS,
} from '@/constants/petOptions'

export default function PetEditDialog({ pet, open, onClose, onSaved, onDeleted }) {
  const navigate = useNavigate()

  const {
    fileInputRef,
    ageCategory, setAgeCategory,
    weightKg, setWeightKg,
    breed, setBreed,
    size, setSize,
    coatType, setCoatType,
    saving,
    uploading,
    deleteMode, setDeleteMode,
    deleteConfirm, setDeleteConfirm,
    deleting,
    error, setError,
    handleSave,
    handlePhotoUpload,
    handleDelete,
    viewingPhoto, setViewingPhoto,
  } = usePetEdit(pet, onSaved, onDeleted)

  if (!pet) return null

  const ageOptions = pet.type === 'dog' ? DOG_AGE_OPTIONS : CAT_AGE_OPTIONS

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <button
              onClick={() => pet.profile_pic_url && setViewingPhoto(true)}
              className={`rounded-full transition-opacity ${
                pet.profile_pic_url ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'
              }`}
            >
              <Avatar size="default">
                <AvatarImage src={pet.profile_pic_url ?? ''} alt={pet.name} />
                <AvatarFallback className="bg-brand-medium-blue text-white">
                  {pet.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
            {pet.name}
          </DialogTitle>
        </DialogHeader>

        {/* Photo viewer */}
        {viewingPhoto ? (
          <div className="flex flex-col items-center gap-4 py-2">
            <img
              src={pet.profile_pic_url}
              alt={pet.name}
              className="w-full rounded-xl object-cover"
            />
            <Button variant="outline" className="w-full" onClick={() => setViewingPhoto(false)}>
              Back
            </Button>
          </div>

        ) : !deleteMode ? (
          <div className="flex flex-col gap-4 py-2">

            {/* Profile pic */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Profile photo
              </Label>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-3.5 h-3.5 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload new photo'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={async () => {
                    const { data: traits } = await supabase
                      .from('pet_physical_traits')
                      .select('*')
                      .eq('pet_id', pet.id)
                      .single()

                    onClose()
                    navigate('/pet-photo', {
                      state: {
                        pet,
                        traits: {
                          size: traits?.size,
                          coat_color: traits?.coat_color,
                          coat_type: traits?.coat_type,
                          ear_type: traits?.ear_type,
                        }
                      }
                    })
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Regenerate AI
                </Button>
              </div>
            </div>

            {/* Breed */}
            <div className="space-y-1.5">
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <Label>Age category</Label>
              <Select value={ageCategory} onValueChange={setAgeCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select age" />
                </SelectTrigger>
                <SelectContent>
                  {ageOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                min="0.1"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>

            {/* Size */}
            <div className="space-y-1.5">
              <Label>Size</Label>
              <div className="flex gap-2">
                {SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSize(opt.value)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      size === opt.value
                        ? 'bg-brand-orange text-white border-brand-orange'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coat type */}
            <div className="space-y-1.5">
              <Label>Coat type</Label>
              <Select value={coatType} onValueChange={setCoatType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select coat type" />
                </SelectTrigger>
                <SelectContent>
                  {COAT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

          </div>

        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm font-medium text-red-700 mb-1">
                Are you sure you want to delete {pet.name}?
              </p>
              <p className="text-xs text-red-600">
                This will permanently delete the pet and all associated data. This action cannot be undone.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">
                Type <span className="font-semibold">{pet.name}</span> to confirm
              </Label>
              <Input
                id="confirm"
                placeholder={pet.name}
                value={deleteConfirm}
                onChange={(e) => { setDeleteConfirm(e.target.value); setError('') }}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        )}

        {!viewingPhoto && (
          <DialogFooter className="flex gap-2">
            {!deleteMode ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 mr-auto"
                  onClick={() => setDeleteMode(true)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete pet
                </Button>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => { setDeleteMode(false); setError('') }}
                  className="mr-auto"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting || deleteConfirm !== pet.name}
                >
                  {deleting ? 'Deleting...' : 'Delete permanently'}
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}