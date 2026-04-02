import { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'en' | 'urdu'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Language switcher
    'language': 'Language',
    'english': 'English',
    'urdu': 'Urdu',
    
    // Module names
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
    
    // Navigation
    'home': 'Home',
    'resources': 'Resources',
    'contact_us': 'Contact Us',
    'sign_in': 'Sign In',
    'sign_out': 'Sign Out',
    'get_started': 'Get Started',
    'my_profile': 'My Profile',
    'dashboard': 'Dashboard',
    'admin_dashboard': 'Admin Dashboard',
    'continue_journey': 'Continue Your Journey',
    'start_journey': 'Start Your Journey',
    'back_to_home': 'Back to Home',
    
    // Home page - Hero
    'trusted_by_parents': 'Trusted by 10,000+ Parents Worldwide',
    'partners_in': 'Partners in',
    'parenting_title': 'Parenting',
    'hero_description': 'Empowering families with evidence-based strategies, practical tools, and expert guidance to build stronger, healthier relationships.',
    'go_to_dashboard': 'Go to Dashboard',
    'happy_families': 'Happy Families',
    'expert_modules': 'Expert Modules',
    'success_rate': 'Success Rate',
    
    // Home page - Features
    'why_choose': 'Why Choose Partners in Parenting?',
    'comprehensive_support': 'Comprehensive support designed to help your family thrive at every stage.',
    'strengthen_relationships': 'Strengthen Relationships',
    'strengthen_desc': 'Build stronger bonds with your children through evidence-based parenting strategies.',
    'expert_guidance': 'Expert Guidance',
    'expert_desc': 'Access professional advice and practical tools from child development specialists.',
    'learn_at_pace': 'Learn at Your Pace',
    'learn_desc': 'Self-paced modules designed to fit into your busy parenting schedule.',
    'proven_methods': 'Proven Methods',
    'proven_desc': 'Techniques backed by research to help your family thrive.',
    
    // Home page - How it works
    'how_it_works': 'How It Works',
    'simple_steps': 'Simple steps to transform your parenting journey.',
    'step1_title': 'Complete Assessments',
    'step1_desc': 'Take our comprehensive parenting assessments to understand your strengths and areas for growth.',
    'step2_title': 'Access Modules',
    'step2_desc': 'Explore personalized learning modules designed specifically for your family\'s needs.',
    'step3_title': 'Transform Family Life',
    'step3_desc': 'Apply proven strategies and watch your family relationships flourish.',
    
    // Home page - Benefits
    'what_you_gain': 'What You\'ll Gain',
    'program_provides': 'Our program provides you with practical tools and knowledge to create a nurturing family environment.',
    'benefit1': 'Improved communication with your children',
    'benefit2': 'Effective discipline strategies',
    'benefit3': 'Stress management techniques',
    'benefit4': 'Better understanding of child development',
    'benefit5': 'Stronger family bonds',
    'benefit6': 'Confidence in your parenting decisions',
    'core_assessments': 'Core Assessments',
    'learning_modules': 'Learning Modules',
    'resource_access': 'Resource Access',
    'satisfaction': 'Satisfaction',
    
    // Home page - CTA
    'ready_to_transform': 'Ready to Transform Your Parenting Journey?',
    'join_parents': 'Join thousands of parents who have already discovered the power of evidence-based parenting strategies.',
    'get_started_free': 'Get Started Free',
    'learn_more': 'Learn More',
    
    // Footer
    'empowering_families': 'Empowering families with evidence-based strategies and expert guidance since 2024.',
    'quick_links': 'Quick Links',
    'account': 'Account',
    'all_rights_reserved': 'All rights reserved.',
    
    // Landing page
    'welcome_back': 'Welcome back',
    'my_dashboard': 'My Dashboard',
    'continue_modules': 'Continue to Modules',
    'complete_assessment': 'Complete Assessment',
    'welcome_get_started': 'Welcome! Let\'s Get Started',
    'assessment_desc': 'Before accessing modules, please complete our initial assessment to help us provide you with most relevant content and support.',
    'comprehensive_modules': '10 Comprehensive Modules',
    'modules_desc': 'From building connections to managing anxiety, each module provides practical strategies for common parenting challenges.',
    'interactive_activities': 'Interactive Activities',
    'activities_desc': 'Engage with quizzes, reflective exercises, and practical activities designed to reinforce learning.',
    'personalized_support': 'Personalized Support',
    'support_desc': 'Our assessment tools help tailor the content to your specific family needs and challenges.',
    'available_modules': 'Available Modules',
    'program_desc': 'A comprehensive parenting support program designed to help families thrive.',
    
    // Dashboard
    'overview': 'Overview',
    'my_scales': 'My Scales',
    'module_progress': 'Module Progress',
    'scales_completed': 'Scales Completed',
    'modules_completed': 'Modules Completed',
    'average_score': 'Average Score',
    'time_spent': 'Time Spent',
    'redo_assessment': 'Redo Assessment',
    'view_modules': 'View Modules',
    'no_modules': 'No modules available',
    
    // Scales
    'scale_child_mental_health': 'Child Mental Health Scale',
    'scale_parent_child_relationship': 'Parent-Child Relationship Scale',
    'scale_parental_mental_wellbeing': 'Parental Mental Wellbeing Scale',
    'scale_parental_self_efficacy': 'Parental Self-Efficacy Scale',
    'question': 'Question',
    'of': 'of',
    'next': 'Next',
    'previous': 'Previous',
    'submit': 'Submit',
    'retake': 'Retake',
    'your_score': 'Your Score',
    'completed': 'Completed',
    'in_progress': 'In Progress',
    'not_started': 'Not Started',
    
    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'save': 'Save',
    'edit': 'Edit',
    'delete': 'Delete',
    'confirm': 'Confirm',
    'close': 'Close',
    'back': 'Back',
    'continue': 'Continue',
    'welcome': 'Welcome',
    'supporting_families': 'Supporting families together',
    'progress': 'Progress',
    'completed_percent': 'completed',
  },
  urdu: {
    // Language switcher
    'language': 'زبان',
    'english': 'انگریزی',
    'urdu': 'اردو',
    
    // Module names
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
    
    // Navigation
    'home': 'ہوم',
    'resources': 'وسائل',
    'contact_us': 'ہم سے رابطہ کریں',
    'sign_in': 'سائن ان کریں',
    'sign_out': 'سائن آؤٹ کریں',
    'get_started': 'شروع کریں',
    'my_profile': 'میری پروفائل',
    'dashboard': 'ڈیش بورڈ',
    'admin_dashboard': 'ایڈمن ڈیش بورڈ',
    'continue_journey': 'اپنے سفر کو جاری رکھیں',
    'start_journey': 'اپنا سفر شروع کریں',
    'back_to_home': 'ہوم پر واپس جائیں',
    
    // Home page - Hero
    'trusted_by_parents': 'دنیا بھر سے 10,000+ والدین کا اعتماد',
    'partners_in': 'شراکت دار',
    'parenting_title': 'پرورش میں',
    'hero_description': 'مزید مضبوط، صحت مند تعلقات بنانے کے لیے ثبوت پر مبنی حکمت عملی، عملی ٹولز اور ماہر رہنمائی کے ساتھ خاندانوں کو بااختیار بنانا۔',
    'go_to_dashboard': 'ڈیش بورڈ پر جائیں',
    'happy_families': 'خوش خاندان',
    'expert_modules': 'ماہر ماڈیولز',
    'success_rate': 'کامیابی کی شرح',
    
    // Home page - Features
    'why_choose': 'پرورش میں شراکت دار کیوں منتخب کریں؟',
    'comprehensive_support': 'ہر مرحلے پر آپ کے خاندان کی خوشحالی میں مدد کے لیے جامع حمایت۔',
    'strengthen_relationships': 'تعلقات مضبوط کریں',
    'strengthen_desc': 'ثبوت پر مبنی پرورش کی حکمت عملی کے ذریعے اپنے بچوں کے ساتھ مضبوط تر رشتہ بنائیں۔',
    'expert_guidance': 'ماہر رہنمائی',
    'expert_desc': 'بچوں کی نشوونما کے ماہرین سے پیشہ ورانہ مشورے اور عملی ٹولز حاصل کریں۔',
    'learn_at_pace': 'اپنی رفتار سے سیکھیں',
    'learn_desc': 'خود سے رفتار والے ماڈیولز جو آپ کے مصروف پرورش کے شیڈول میں فٹ ہوتے ہیں۔',
    'proven_methods': 'ثابت شدہ طریقے',
    'proven_desc': 'تحقیق کی حمایت یافتہ تکنیکیں جو آپ کے خاندان کی خوشحالی میں مدد کرتی ہیں۔',
    
    // Home page - How it works
    'how_it_works': 'یہ کیسے کام کرتا ہے',
    'simple_steps': 'اپنے پرورش کے سفر کو تبدیل کرنے کے لیے سادہ مراحل۔',
    'step1_title': 'جائزے مکمل کریں',
    'step1_desc': 'اپنی طاقتوں اور ترقی کے شعبوں کو سمجھنے کے لیے ہمارے جامع پرورش کے جائزے لیں۔',
    'step2_title': 'ماڈیولز تک رسائی حاصل کریں',
    'step2_desc': 'خاص طور پر آپ کے خاندان کی ضروریات کے لیے ڈیزائن کردہ ذاتی نوعیت کے سیکھنے والے ماڈیولز دریافت کریں۔',
    'step3_title': 'خاندانی زندگی کو تبدیل کریں',
    'step3_desc': 'ثابت شدہ حکمت عملی لاغو کریں اور اپنے خاندانی تعلقات کو پھلتے ہوئے دیکھیں۔',
    
    // Home page - Benefits
    'what_you_gain': 'آپ کو کیا حاصل ہوگا',
    'program_provides': 'ہمارا پروگرام آپ کو ایک پرورش کرنے والے خاندانی ماحول بنانے کے لیے عملی ٹولز اور علم فراہم کرتا ہے۔',
    'benefit1': 'اپنے بچوں کے ساتھ بہتر مواصلت',
    'benefit2': 'مؤثر نظم و ضبط کی حکمت عملی',
    'benefit3': 'دباؤ کے انتظام کی تکنیکیں',
    'benefit4': 'بچوں کی نشوونما کی بہتر سمجھ',
    'benefit5': 'مضبوط خاندانی بندھن',
    'benefit6': 'اپنے پرورش کے فیصلوں میں اعتماد',
    'core_assessments': 'بنیادی جائزے',
    'learning_modules': 'سیکھنے والے ماڈیولز',
    'resource_access': 'وسائل تک رسائی',
    'satisfaction': 'اطمینان',
    
    // Home page - CTA
    'ready_to_transform': 'اپنے پرورش کے سفر کو تبدیل کرنے کے لیے تیار ہیں؟',
    'join_parents': 'ہزاروں والدین سے جڑیں جنہوں نے پہلے ہی ثبوت پر مبنی پرورش کی حکمت عملی کی طاقت دریافت کر لی ہے۔',
    'get_started_free': 'مفت میں شروع کریں',
    'learn_more': 'مزید جانیں',
    
    // Footer
    'empowering_families': '2024 سے ثبوت پر مبنی حکمت عملی اور ماہر رہنمائی کے ساتھ خاندانوں کو بااختیار بنانا۔',
    'quick_links': 'فوری لنکس',
    'account': 'اکاؤنٹ',
    'all_rights_reserved': 'جملہ حقوق محفوظ ہیں۔',
    
    // Landing page
    'welcome_back': 'خوش آمدید',
    'my_dashboard': 'میرا ڈیش بورڈ',
    'continue_modules': 'ماڈیولز جاری رکھیں',
    'complete_assessment': 'جائزہ مکمل کریں',
    'welcome_get_started': 'خوش آمدید! آئیں شروع کریں',
    'assessment_desc': 'ماڈیولز تک رسائی سے پہلے، براہ کرم ہمارا ابتدائی جائزہ مکمل کریں تاکہ ہم آپ کو سب سے زیادہ متعلقہ مواد اور حمایت فراہم کر سکیں۔',
    'comprehensive_modules': '10 جامع ماڈیولز',
    'modules_desc': 'تعلقات بنانے سے لے کر فکر کا انتظام کرنے تک، ہر ماڈیول عام پرورش کے چیلنجز کے لیے عملی حکمت عملی فراہم کرتا ہے۔',
    'interactive_activities': 'انٹرایکٹو سرگرمیاں',
    'activities_desc': 'سیکھنے کو مضبوط کرنے کے لیے ڈیزائن کردہ کوئز، تدبر کرنے کی مشقیں اور عملی سرگرمیوں میں شامل ہوں۔',
    'personalized_support': 'ذاتی نوعیت کی حمایت',
    'support_desc': 'ہمارے جائزہ کے ٹولز مواد کو آپ کی مخصوص خاندانی ضروریات اور چیلنجز کے مطابق بنانے میں مدد کرتے ہیں۔',
    'available_modules': 'دستیاب ماڈیولز',
    'program_desc': 'خاندانوں کی خوشحالی میں مدد کے لیے ڈیزائن کردہ ایک جامع پرورش کی حمایتی پروگرام۔',
    
    // Dashboard
    'overview': 'جائزہ',
    'my_scales': 'میرے پیمانے',
    'module_progress': 'ماڈیول کا پیش رفت',
    'scales_completed': 'مکمل شدہ پیمانے',
    'modules_completed': 'مکمل شدہ ماڈیولز',
    'average_score': 'اوسط اسکور',
    'time_spent': 'صرف کیا گیا وقت',
    'redo_assessment': 'جائزہ دوبارہ کریں',
    'view_modules': 'ماڈیولز دیکھیں',
    'no_modules': 'کوئی ماڈیولز دستیاب نہیں',
    
    // Scales
    'scale_child_mental_health': 'بچوں کی دماغی صحت کا پیمانہ',
    'scale_parent_child_relationship': 'والدین-بچہ تعلقات کا پیمانہ',
    'scale_parental_mental_wellbeing': 'والدین کی دماغی خوشحالی کا پیمانہ',
    'scale_parental_self_efficacy': 'والدین کی خودکارکردگی کا پیمانہ',
    'question': 'سوال',
    'of': 'میں سے',
    'next': 'اگلا',
    'previous': 'پچھلا',
    'submit': 'جمع کرائیں',
    'retake': 'دوبارہ لیں',
    'your_score': 'آپ کا اسکور',
    'completed': 'مکمل',
    'in_progress': 'جاری ہے',
    'not_started': 'شروع نہیں ہوا',
    
    // Common
    'loading': 'لوڈ ہو رہا ہے...',
    'error': 'خرابی',
    'success': 'کامیابی',
    'cancel': 'منسوخ کریں',
    'save': 'محفوظ کریں',
    'edit': 'ترمیم کریں',
    'delete': 'حذف کریں',
    'confirm': 'تصدیق کریں',
    'close': 'بند کریں',
    'back': 'واپس',
    'continue': 'جاری رکھیں',
    'welcome': 'خوش آمدید',
    'supporting_families': 'خاندانوں کی حمایت میں',
    'progress': 'پیش رفت',
    'completed_percent': 'مکمل',
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
    // Force reload to ensure all components re-render with new language
    window.location.reload()
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
