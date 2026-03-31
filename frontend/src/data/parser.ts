import type { Module, PageContent, ContentBlock } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const modulesConfig = [
  { id: 'module_1_connect', slug: 'm1-connect', name: 'Connect', pages: 23 },
  { id: 'module_2_parenting_in_pandemic', slug: 'm2-parenting-in-pandemic', name: 'Parenting in Pandemic', pages: 22 },
  { id: 'module_3_family_rules', slug: 'm3-family-rules', name: 'Family Rules', pages: 14 },
  { id: 'module_4_nurture', slug: 'm4-nurture', name: 'Nurture', pages: 16 },
  { id: 'module_5_conflict', slug: 'm5-conflict', name: 'Conflict', pages: 18 },
  { id: 'module_6_friends', slug: 'm6-friends', name: 'Friends', pages: 12 },
  { id: 'module_7_health_habits', slug: 'm7-health-habits', name: 'Health Habits', pages: 15 },
  { id: 'module_8_problems', slug: 'm8-problems', name: 'Problems', pages: 17 },
  { id: 'module_9_anxiety', slug: 'm9-anxiety', name: 'Anxiety', pages: 13 },
  { id: 'module_10_seeking_help', slug: 'm10-seeking-help', name: 'Seeking Help', pages: 11 },
]

// Better title mappings for specific patterns
const titleMappings: Record<string, string> = {
  '00-home': 'Connect',
  '01-checking-in': 'Checking in',
  '02-good-relationship': 'Good relationship?',
  '03-ups-and-downs': 'Why the ups and downs?',
  '04-pandemic-emotions': 'Emotions during the pandemic',
  '05-three-strategies': 'Three strategies',
  '06-show-affection': 'Show affection and encouragement',
  '07-things-you-can-do': 'Things you can do',
  '08-things-you-can-say': 'Things you can say',
  '09-be-genuine': 'Remember …',
  '10-take-time-to-talk': 'Take the time to talk',
  '11-conversation': 'Have the conversation',
  '12-talking-to-brickwall': 'It\'s like talking to a brick wall!',
  '13-talking-tough-stuff': 'Talking through the tough stuff',
  '14-identify-validate-understand': 'Identify, validate & understand',
  '15-things-to-avoid': 'Things to avoid',
  '16-your-response-matters': 'Your response matters',
  '17-video-activity': 'Activity',
  '18-pandemic-support': 'Supporting them during the pandemic',
  '19-pandemic-bounceback': 'What if they don\'t \'bounce back\'?',
  '20-goals': 'Putting it into practice',
  '21-quiz': 'Quiz',
  '22-dont-blame-yourself': 'Keep in mind',
}


export async function parseAllModules(): Promise<Module[]> {
  const modules: Module[] = []
  for (const config of modulesConfig) {
    try {
      const pages = await loadModulePages(config.id, config.slug, config.name, config.pages)
      if (pages.length > 0) {
        modules.push({ slug: config.slug, name: config.name, pages })
      }
    } catch (error) {
      console.warn(`Failed to load module ${config.id}:`, error)
    }
  }
  return modules
}

async function loadModulePages(moduleId: string, moduleSlug: string, moduleName: string, expectedPages: number): Promise<PageContent[]> {
  const pages: PageContent[] = []
  const pageCacheKey = `${moduleId}-${expectedPages}`
  
  // Check cache first
  if (pageCache.has(pageCacheKey)) {
    return pageCache.get(pageCacheKey)!
  }
  
  // Known page slugs for each module to avoid 2000+ HTTP requests
  const knownPagePatterns: Record<string, string[]> = {
    'module_1_connect': ['00-home', '01-checking-in', '02-good-relationship', '03-ups-and-downs', '04-pandemic-emotions', '05-three-strategies', '06-show-affection', '07-things-you-can-do', '08-things-you-can-say', '09-be-genuine', '10-take-time-to-talk', '11-conversation', '12-talking-to-brickwall', '13-talking-tough-stuff', '14-identify-validate-understand', '15-things-to-avoid', '16-your-response-matters', '17-video-activity', '18-pandemic-support', '19-pandemic-bounceback', '20-goals', '21-quiz', '22-dont-blame-yourself'],
    'module_2_parenting_in_pandemic': ['00-home', '01-checking-in', '02-covid-changes', '03-your-experience', '04-teen-experience', '05-recognising-emotions', '06-mindfulness', '07-mindfulness-activity', '08-spot-emotions', '09-allow-emotions', '10-allow-emotions-activity', '11-everyone-struggles', '12-strategies-covid', '13-connection', '14-routines', '15-silver-linings', '16-expectations', '17-optional-topics', '18-work-from-home', '19-online-learning', '20-support-online-learning', '21-facetoface-school', '22-loved-one', '23-loved-one-covid', '24-loved-one-death', '25-signs-grief', '26-support-grief', '27-family-violence', '28-risk-family-violence', '29-seek-help'],
    'module_3_family_rules': ['00-home', '01-checking-in', '02-why-family-rules', '03-what-rules', '04-who-makes-rules', '05-how-to-rules', '06-apply-rules', '07-review-rules', '08-rules-as-foundations', '09-reward-good-behaviour', '10-reflect-on-rules', '11-goals', '12-quiz', '13-dont-blame-yourself'],
    'module_4_nurture': ['00-home', '01-checking-in', '02-why-nurture', '03-what-is-nurture', '04-nurture-example', '05-warmth-responsiveness', '06-ways-to-respond', '07-sensitivity', '08-sensitivity-example', '09-acceptance', '10-acceptance-example', '11-praise', '12-praise-example', '13-rewards', '14-rewards-example', '15-goals', '16-quiz', '17-dont-blame-yourself'],
    'module_5_conflict': ['00-home', '01-checking-in', '02-why-conflict', '03-what-conflict', '04-conflict-example', '05-conflict-styles', '06-understand-teen', '07-ways-to-respond', '08-emotions', '09-plan-ahead', '10-plan-example', '11-in-the-moment', '12-in-moment-example', '13-goals', '14-quiz', '15-dont-blame-yourself'],
    'module_6_friends': ['00-home', '01-checking-in', '02-why-friends', '03-peer-importance', '04-friendship-skills', '05-social-challenges', '06-supporting-socially', '07-goals', '08-quiz', '09-dont-blame-yourself'],
    'module_7_health_habits': ['00-home', '01-checking-in', '02-why-health-habits', '03-healthy-habits', '04-sleep-nutrition', '05-physical-activity', '06-mental-wellbeing', '07-goals', '08-quiz', '09-dont-blame-yourself'],
    'module_8_problems': ['00-home', '01-checking-in', '02-why-problems', '03-problem-solving', '04-step-by-step', '05-practical-problems', '06-when-to-seek-help', '07-goals', '08-quiz', '09-dont-blame-yourself'],
    'module_9_anxiety': ['00-home', '01-checking-in', '02-why-anxiety', '03-understanding-anxiety', '04-anxiety-signs', '05-coping-strategies', '06-supporting-anxious', '07-when-professional', '08-goals', '09-quiz', '10-dont-blame-yourself'],
    'module_10_seeking_help': ['00-home', '01-checking-in', '02-mental-health', '03-risk-factors', '04-depression-signs', '05-anxiety-signs', '06-what-is-normal', '07-what-should-i-do', '08-teen-seek-help', '09-where-is-help', '10-previous-depression', '11-goals', '12-quiz', '13-dont-blame-yourself'],
  }
  
  const patterns = knownPagePatterns[moduleId] || []
  
  // Fetch all pages in parallel (limited to expectedPages)
  const pagePromises = patterns.slice(0, expectedPages).map(async (pattern) => {
    try {
      const response = await fetch(`${API_URL}/content/${moduleId}/${pattern}`)
      if (!response.ok) return null
      
      const data = await response.json()
      if (data.status !== 'success' || !data.data?.content) return null
      
      const text = data.data.content
      if (!text || text.trim().length < 10) return null
      
      const content = parseContent(text)
      if (content.length === 0) return null
      
      let title = titleMappings[pattern]
      if (!title) {
        const extracted = extractTitle(content)
        title = extracted || pattern.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
      
      return { slug: pattern, title, moduleSlug, moduleName, content }
    } catch {
      return null
    }
  })
  
  const results = await Promise.all(pagePromises)
  
  // Filter out nulls and add to pages
  for (const page of results) {
    if (page) pages.push(page)
  }
  
  // Sort by slug to maintain order
  pages.sort((a, b) => a.slug.localeCompare(b.slug))
  
  // Cache the result
  pageCache.set(pageCacheKey, pages)
  return pages
}

// Page cache
const pageCache = new Map<string, PageContent[]>()

function parseContent(text: string): ContentBlock[] {
  const blocks: ContentBlock[] = []
  const lines = text.split('\n').filter(line => line.trim())
  
  let currentList: string[] = []
  let inQuote = false
  let quoteText = ''
  let quoteAuthor = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Handle headings (H1, H2, H3, etc.)
    const headingMatch = line.match(/^(H[1-6])\s+(.+)$/i)
    if (headingMatch) {
      // Flush any pending list
      if (currentList.length > 0) {
        blocks.push({ type: 'list', items: [...currentList] })
        currentList = []
      }
      blocks.push({
        type: 'heading',
        level: parseInt(headingMatch[1][1]),
        text: headingMatch[2],
      })
      continue
    }
    
    // Handle images
    const imageMatch = line.match(/\[IMAGE:\s*([^\]]+)\]/i)
    if (imageMatch) {
      if (currentList.length > 0) {
        blocks.push({ type: 'list', items: [...currentList] })
        currentList = []
      }
      const parts = imageMatch[1].split(' - ')
      blocks.push({
        type: 'image',
        src: parts[0].trim(),
        alt: parts[1]?.trim(),
      })
      continue
    }
    
    // Handle videos
    const videoMatch = line.match(/\[VIDEO:\s*([^\]]+)\]/i)
    if (videoMatch) {
      if (currentList.length > 0) {
        blocks.push({ type: 'list', items: [...currentList] })
        currentList = []
      }
      blocks.push({
        type: 'video',
        src: videoMatch[1].trim(),
      })
      continue
    }
    
    // Handle audio
    const audioMatch = line.match(/\[AUDIO:\s*([^\]]+)\]/i)
    if (audioMatch) {
      if (currentList.length > 0) {
        blocks.push({ type: 'list', items: [...currentList] })
        currentList = []
      }
      blocks.push({
        type: 'audio',
        src: audioMatch[1].trim(),
      })
      continue
    }
    
    // Handle expandable content markers
    if (line.includes('[EXPANDABLE CONTENT')) {
      if (currentList.length > 0) {
        blocks.push({ type: 'list', items: [...currentList] })
        currentList = []
      }
      blocks.push({
        type: 'expandable',
        text: 'Click to reveal more content',
      })
      continue
    }
    
    // Handle bullet lists
    if (line.startsWith('- ')) {
      currentList.push(line.substring(2))
      continue
    }
    
    // Handle numbered lists
    const numberedMatch = line.match(/^\d+\.\s+(.+)$/)
    if (numberedMatch) {
      currentList.push(numberedMatch[1])
      continue
    }
    
    // Handle table rows
    if (line.includes(' | ')) {
      if (currentList.length > 0) {
        blocks.push({ type: 'list', items: [...currentList] })
        currentList = []
      }
      const cells = line.split(' | ').map(c => c.trim())
      blocks.push({
        type: 'table',
        rows: [cells],
      })
      continue
    }
    
    // Regular paragraph
    if (currentList.length > 0) {
      blocks.push({ type: 'list', items: [...currentList] })
      currentList = []
    }
    
    // Check for quote attribution (next line after quote)
    if (inQuote && !quoteAuthor && line.length < 100 && !line.includes('.')) {
      quoteAuthor = line
      blocks.push({
        type: 'quote',
        text: quoteText.trim(),
        author: quoteAuthor,
      })
      inQuote = false
      quoteText = ''
      quoteAuthor = ''
      continue
    }
    
    blocks.push({
      type: 'paragraph',
      text: line,
    })
  }
  
  // Flush any remaining list
  if (currentList.length > 0) {
    blocks.push({ type: 'list', items: currentList })
  }
  
  return blocks
}

function extractTitle(blocks: ContentBlock[]): string | undefined {
  const firstHeading = blocks.find(b => b.type === 'heading')
  return firstHeading?.type === 'heading' ? firstHeading.text : undefined
}
