import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle } from 'lucide-react'
import { useAddPet } from '@/hooks/useAddPet'
import logo from '@/assets/logo/logo_navbar.png'

const SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

const COAT_TYPE_OPTIONS = [
  { value: 'short', label: 'Short' },
  { value: 'long', label: 'Long' },
  { value: 'curly', label: 'Curly' },
  { value: 'none', label: 'None / Hairless' },
]

const EAR_TYPE_OPTIONS = [
  { value: 'floppy', label: 'Floppy' },
  { value: 'normal', label: 'Normal' },
  { value: 'pointed', label: 'Pointed' },
]

export default function AddPet({ redirectTo = '/pet-photo' }) {
  const {
    name, setName,
    type, setType,
    breedType, setBreedType,
    breed, setBreed,
    mixedBreedDesc, setMixedBreedDesc,
    ageCategory, setAgeCategory,
    weightKg, setWeightKg,
    size, setSize,
    coatColor, setCoatColor,
    coatType, setCoatType,
    earType, setEarType,
    error,
    loading,
    handleSubmit,
    getAgeOptions,
    breeds,
  } = useAddPet(redirectTo)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img
            src={logo}
            alt="Smart Pet Home"
            className="h-12 w-auto mx-auto mb-2"
          />
          <CardTitle>Add your pet</CardTitle>
          <CardDescription>
            Tell us about your furry friend to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Pet name */}
          <div className="space-y-2">
            <Label htmlFor="name">Pet name</Label>
            <Input
              id="name"
              placeholder="Buddy"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Pet type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(val) => { setType(val); setBreed('') }}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dog">Dog</SelectItem>
                <SelectItem value="cat">Cat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Breed */}
          {type && (
            <div className="space-y-2">
              <Label>Breed</Label>
              <div className="flex gap-2">
                {['pure', 'mixed', 'unknown'].map((bt) => (
                  <button
                    key={bt}
                    onClick={() => {
                      setBreedType(bt)
                      setBreed('')
                      setMixedBreedDesc('')
                    }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      breedType === bt
                        ? 'bg-brand-orange text-white border-brand-orange'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {bt === 'pure' ? 'Pure breed' : bt === 'mixed' ? 'Mixed' : 'Unknown'}
                  </button>
                ))}
              </div>

              {breedType === 'pure' && (
                <Select value={breed} onValueChange={setBreed}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select breed" />
                  </SelectTrigger>
                  <SelectContent>
                    {breeds.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {breedType === 'mixed' && (
                <Input
                  placeholder="e.g. Golden Retriever mix"
                  value={mixedBreedDesc}
                  onChange={(e) => setMixedBreedDesc(e.target.value)}
                />
              )}
            </div>
          )}

          {/* Age category */}
          {type && (
            <div className="space-y-2">
              <Label>Age</Label>
              <Select value={ageCategory} onValueChange={setAgeCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select age category" />
                </SelectTrigger>
                <SelectContent>
                  {getAgeOptions().map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              min="0.1"
              step="0.1"
              placeholder="4.5"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          </div>

          {/* Physical traits */}
          {type && (
            <>
              <div className="border-t border-border pt-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Physical traits
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  These help us generate an AI portrait of your pet.
                </p>
              </div>

              {/* Size */}
              <div className="space-y-2">
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

              {/* Coat color */}
              <div className="space-y-2">
                <Label htmlFor="coat_color">Coat color</Label>
                <Input
                  id="coat_color"
                  placeholder="e.g. golden, black and white"
                  value={coatColor}
                  onChange={(e) => setCoatColor(e.target.value)}
                />
              </div>

              {/* Coat type */}
              <div className="space-y-2">
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

              {/* Ear type */}
              <div className="space-y-2">
                <Label>Ear type</Label>
                <div className="flex gap-2">
                  {EAR_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setEarType(opt.value)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        earType === opt.value
                          ? 'bg-brand-orange text-white border-brand-orange'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Continue'}
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}