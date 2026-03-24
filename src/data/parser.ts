import type { Module, PageContent, ContentBlock } from '../types'

const modulesConfig = [
  { id: 'module_1_connect', slug: 'm1-connect', name: 'Connect' },
  { id: 'module_2_parenting_in_pandemic', slug: 'm2-parenting-in-pandemic', name: 'Parenting in Pandemic' },
  { id: 'module_3_family_rules', slug: 'm3-family-rules', name: 'Family Rules' },
  { id: 'module_4_nurture', slug: 'm4-nurture', name: 'Nurture' },
  { id: 'module_5_conflict', slug: 'm5-conflict', name: 'Conflict' },
  { id: 'module_6_friends', slug: 'm6-friends', name: 'Friends' },
  { id: 'module_7_health_habits', slug: 'm7-health-habits', name: 'Health Habits' },
  { id: 'module_8_problems', slug: 'm8-problems', name: 'Problems' },
  { id: 'module_9_anxiety', slug: 'm9-anxiety', name: 'Anxiety' },
  { id: 'module_10_seeking_help', slug: 'm10-seeking-help', name: 'Seeking Help' },
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
      const pages = await loadModulePages(config.id, config.slug, config.name)
      if (pages.length > 0) {
        modules.push({ slug: config.slug, name: config.name, pages })
      }
    } catch (error) {
      console.warn(`Failed to load module ${config.id}:`, error)
    }
  }
  return modules
}

async function loadModulePages(moduleId: string, moduleSlug: string, moduleName: string): Promise<PageContent[]> {
  const pages: PageContent[] = []
  
  try {
    // Get list of all .txt files in the module directory
    const response = await fetch(`/scraped_data/${moduleId}/`)
    if (!response.ok) {
      console.warn(`Could not list files for module ${moduleId}`)
      return pages
    }
    
    // Since we can't directly list directory contents via fetch, 
    // we'll try a more comprehensive approach with all possible page numbers
    const maxPages = 50 // Increased max pages to catch more files
    
    for (let i = 0; i < maxPages; i++) {
      const pageNum = i.toString().padStart(2, '0')
      
      // First try to get the page directly by number
      let found = false
      
      // Try common page patterns for this number
      const patterns = [
        `${pageNum}-home`,
        `${pageNum}-checking-in`,
        `${pageNum}-good-relationship`,
        `${pageNum}-ups-and-downs`,
        `${pageNum}-pandemic-emotions`,
        `${pageNum}-three-strategies`,
        `${pageNum}-show-affection`,
        `${pageNum}-things-you-can-do`,
        `${pageNum}-things-you-can-say`,
        `${pageNum}-be-genuine`,
        `${pageNum}-take-time-to-talk`,
        `${pageNum}-conversation`,
        `${pageNum}-talking-to-brickwall`,
        `${pageNum}-talking-tough-stuff`,
        `${pageNum}-identify-validate-understand`,
        `${pageNum}-things-to-avoid`,
        `${pageNum}-your-response-matters`,
        `${pageNum}-video-activity`,
        `${pageNum}-pandemic-support`,
        `${pageNum}-pandemic-bounceback`,
        `${pageNum}-goals`,
        `${pageNum}-quiz`,
        `${pageNum}-dont-blame-yourself`,
        `${pageNum}-care-for-yourself`,
        `${pageNum}-self-care`,
        `${pageNum}-ask-support`,
        `${pageNum}-discuss`,
        `${pageNum}-find-info`,
        `${pageNum}-have-conversation`,
        `${pageNum}-address-misconceptions`,
        `${pageNum}-follow-restrictions`,
        `${pageNum}-new-normal`,
        `${pageNum}-coping-worries`,
        `${pageNum}-easing-restrictions`,
        `${pageNum}-connection`,
        `${pageNum}-routines`,
        `${pageNum}-silver-linings`,
        `${pageNum}-expectations`,
        `${pageNum}-optional-topics`,
        `${pageNum}-work-from-home`,
        `${pageNum}-online-learning`,
        `${pageNum}-support-online-learning`,
        `${pageNum}-facetoface-school`,
        `${pageNum}-loved-one`,
        `${pageNum}-loved-one-covid`,
        `${pageNum}-loved-one-death`,
        `${pageNum}-signs-grief`,
        `${pageNum}-support-grief`,
        `${pageNum}-family-violence`,
        `${pageNum}-risk-family-violence`,
        `${pageNum}-seek-help`,
        `${pageNum}-why-family-rules`,
        `${pageNum}-what-rules`,
        `${pageNum}-who-makes-rules`,
        `${pageNum}-how-to-rules`,
        `${pageNum}-apply-rules`,
        `${pageNum}-review-rules`,
        `${pageNum}-rules-as-foundations`,
        `${pageNum}-reward-good-behaviour`,
        `${pageNum}-reflect-on-rules`,
        `${pageNum}-balancing-act`,
        `${pageNum}-how-to-stay-connected`,
        `${pageNum}-know-your-teen`,
        `${pageNum}-ways-to-connect`,
        `${pageNum}-the-together-list`,
        `${pageNum}-encourage-independence`,
        `${pageNum}-responsibilities`,
        `${pageNum}-other-activities`,
        `${pageNum}-am-i-over-involved`,
        `${pageNum}-manage-disagreements`,
        `${pageNum}-conflict-partner`,
        `${pageNum}-establish-ground-rules`,
        `${pageNum}-ground-rules`,
        `${pageNum}-ground-rules-cont`,
        `${pageNum}-remain-calm`,
        `${pageNum}-siblings`,
        `${pageNum}-assertive-communication`,
        `${pageNum}-communication-styles`,
        `${pageNum}-communication-styles-cont`,
        `${pageNum}-carry-on-loving-them`,
        `${pageNum}-friendships`,
        `${pageNum}-social-situations`,
        `${pageNum}-you-and-their-friends`,
        `${pageNum}-friends-range-of-ages`,
        `${pageNum}-good-social-skills`,
        `${pageNum}-friendship-troubles`,
        `${pageNum}-navigate-problems`,
        `${pageNum}-encourage-healthy-habits`,
        `${pageNum}-healthy-diet`,
        `${pageNum}-how-to-healthy-diet`,
        `${pageNum}-daily-exercise`,
        `${pageNum}-build-into-life`,
        `${pageNum}-screentime`,
        `${pageNum}-screentime-quiz`,
        `${pageNum}-healthy-screen-use`,
        `${pageNum}-sleep-habits`,
        `${pageNum}-what-if-sleep-problems`,
        `${pageNum}-no-alcohol-drugs`,
        `${pageNum}-what-if-alchohol-drugs`,
        `${pageNum}-deal-with-problems`,
        `${pageNum}-problem-solving`,
        `${pageNum}-brainstorm-solutions`,
        `${pageNum}-evaluate-solutions`,
        `${pageNum}-decide-solution`,
        `${pageNum}-evaluate-outcome`,
        `${pageNum}-stress-management`,
        `${pageNum}-signs-of-stress`,
        `${pageNum}-pressures-expectations`,
        `${pageNum}-anxiety`,
        `${pageNum}-parental-accommodation`,
        `${pageNum}-reflection`,
        `${pageNum}-support`,
        `${pageNum}-facing-fears`,
        `${pageNum}-other-tips`,
        `${pageNum}-manage-own-anxiety`,
        `${pageNum}-mental-health`,
        `${pageNum}-risk-factors`,
        `${pageNum}-depression-signs`,
        `${pageNum}-anxiety-signs`,
        `${pageNum}-what-is-normal`,
        `${pageNum}-what-should-i-do`,
        `${pageNum}-teen-seek-help`,
        `${pageNum}-where-is-help`,
        `${pageNum}-previous-depression`,
      ]
      
      for (const pattern of patterns) {
        const slug = pattern
        try {
          const response = await fetch(`/scraped_data/${moduleId}/${slug}.txt`)
          if (response.ok) {
            const text = await response.text()
            
            // Skip if content is empty, too short, or is HTML (404 fallback)
            if (!text || text.trim().length < 10 || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
              continue
            }
            
            const content = parseContent(text)
            
            // Skip if no content parsed
            if (content.length === 0) {
              continue
            }
            
            let title = extractTitle(content)
            
            // Check if we have a predefined title for this pattern
            const patternKey = pattern.replace(/^\d+-/, '') // Remove number prefix
            if (titleMappings[patternKey]) {
              title = titleMappings[patternKey]
            } else if (!title || title === 'Connect' || title.length < 3) {
              // Generate a more readable fallback title from the pattern if H1 is not descriptive
              const patternParts = pattern.split('-')
              const pageName = patternParts.slice(1).join('-')
              const fallbackTitle = pageName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
              
              // Use fallback if the extracted title is too generic or non-existent
              if (!title || title === 'Connect' || title.length < 3) {
                title = fallbackTitle
              }
            }
            
            pages.push({ slug, title, moduleSlug, moduleName, content })
            found = true
            break
          }
        } catch {
          // Continue to next pattern
        }
      }
      
      // If no pattern found for this number, stop trying higher numbers
      if (!found && i > 10) {
        // Check if we've reached the end by trying a few more numbers
        let consecutiveFailures = 0
        for (let j = i; j < Math.min(i + 5, maxPages); j++) {
          let anyFound = false
          
          for (const pattern of patterns) {
            const slug = pattern
            try {
              const checkResponse = await fetch(`/scraped_data/${moduleId}/${slug}.txt`)
              if (checkResponse.ok) {
                anyFound = true
                break
              }
            } catch {
              // Continue
            }
          }
          
          if (!anyFound) {
            consecutiveFailures++
          } else {
            consecutiveFailures = 0
          }
          
          if (consecutiveFailures >= 3) {
            return pages // End of pages reached
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Error loading module ${moduleId}:`, error)
  }
  
  return pages.sort((a, b) => a.slug.localeCompare(b.slug))
}

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
