import { ContentBlock } from '../../types'

interface HomePageProps {
  content: ContentBlock[]
  moduleSlug: string
}

export default function HomePage({ content, moduleSlug }: HomePageProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl shadow-xl p-8">
        {content.map((block, index) => (
          <div key={index} className="mb-6">
            {block.type === 'heading' && (
              <h1 className={`font-bold text-gray-800 mb-6 ${
                block.level === 1 ? 'text-4xl text-center' :
                block.level === 2 ? 'text-3xl' :
                block.level === 3 ? 'text-2xl' : 'text-xl'
              }`}>
                {block.text}
              </h1>
            )}
            
            {block.type === 'paragraph' && (
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {block.text}
              </p>
            )}
            
            {block.type === 'list' && (
              <ul className="list-disc pl-6 mb-6 space-y-2">
                {block.items.map((item, i) => (
                  <li key={i} className="text-gray-700 text-lg">{item}</li>
                ))}
              </ul>
            )}
            
            {block.type === 'image' && (
              <div className="my-6">
                <img
                  src={`/scraped_data/${moduleSlug.replace('m', 'module_').replace('-', '_')}/images/${block.src}`}
                  alt={block.alt || ''}
                  className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
