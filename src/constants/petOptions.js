export const DOG_AGE_OPTIONS = [
  { value: 'puppy', label: 'Puppy (under 1 year)' },
  { value: 'adult_dog', label: 'Adult (1–7 years)' },
  { value: 'senior_dog', label: 'Senior (8+ years)' },
]

export const CAT_AGE_OPTIONS = [
  { value: 'kitten', label: 'Kitten (under 1 year)' },
  { value: 'adult_cat', label: 'Adult (1–10 years)' },
  { value: 'senior_cat', label: 'Senior (11+ years)' },
]

export const COAT_TYPE_OPTIONS = [
  { value: 'short', label: 'Short' },
  { value: 'long', label: 'Long' },
  { value: 'curly', label: 'Curly' },
  { value: 'none', label: 'None / Hairless' },
]

export const SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

export function formatAgeCategory(category) {
  const map = {
    puppy: 'Puppy', kitten: 'Kitten',
    adult_dog: 'Adult', adult_cat: 'Adult',
    senior_dog: 'Senior', senior_cat: 'Senior',
  }
  return map[category] ?? category
}