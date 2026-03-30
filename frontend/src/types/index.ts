export interface PageContent {
  slug: string
  title: string
  moduleSlug: string
  moduleName: string
  content: ContentBlock[]
}

export interface Module {
  slug: string
  name: string
  pages: PageContent[]
}

export type ContentBlock =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; alt?: string }
  | { type: 'video'; src: string }
  | { type: 'audio'; src: string }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'expandable'; text: string }
  | { type: 'table'; rows: string[][] }
