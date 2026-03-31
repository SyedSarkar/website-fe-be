import { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'en' | 'urdu'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    'language': 'Language',
    'english': 'English',
    'urdu': 'Urdu',
    'connect': 'Connect',
    'parenting_in_pandemic': 'Parenting in Pandemic',
    'family_rules': 'Family Rules',
    'nurture': 'Nurture',
    'conflict': 'Conflict',
    'friends': 'Friends',
    'health_habits': 'Health Habits',
    'problems': 'Problems',
    'anxiety': 'Anxiety',
    'seeking_help': 'Seeking Help',
  },
  urdu: {
    'language': 'زبان',
    'english': 'انگریزی',
    'urdu': 'اردو',
    'connect': 'جڑنا',
    'parenting_in_pandemic': 'وبا میں پرورش',
    'family_rules': 'خانہ داری کے قواعد',
    'nurture': 'پرورش',
    'conflict': 'تصادم',
    'friends': 'دوست',
    'health_habits': 'صحت کی عادات',
    'problems': 'مسائل',
    'anxiety': 'فکر',
    'seeking_help': 'مدد حاصل کرنا',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language')
    return (saved as Language) || 'en'
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
