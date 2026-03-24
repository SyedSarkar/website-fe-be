import { ContentBlock } from '../../types'

interface ModulePageProps {
  content: ContentBlock[]
  moduleSlug: string
}

export default function ModulePage({ content, moduleSlug }: ModulePageProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {content.map((block, index) => (
          <div key={index} className="mb-6">
            {block.type === 'heading' && (
              <h1 className={`font-bold text-gray-800 mb-6 ${
                block.level === 1 ? 'text-4xl text-teal-700' :
                block.level === 2 ? 'text-3xl text-teal-600' :
                block.level === 3 ? 'text-2xl text-teal-600' : 'text-xl text-teal-600'
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
                  <li key={i} className="text-gray-700">{item}</li>
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

            {block.type === 'video' && (
              <div className="my-6 p-4 bg-gray-100 rounded-lg flex items-center gap-3">
                <div className="w-6 h-6 text-teal-600 flex items-center justify-center">
                  ▶
                </div>
                <div>
                  <p className="font-medium text-gray-800">Video</p>
                  <a href={block.src} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:underline">
                    {block.src}
                  </a>
                </div>
              </div>
            )}

            {block.type === 'audio' && (
              <div className="my-6 p-4 bg-gray-100 rounded-lg flex items-center gap-3">
                <div className="w-6 h-6 text-teal-600 flex items-center justify-center">
                  🔊
                </div>
                <div>
                  <p className="font-medium text-gray-800">Audio</p>
                  <a href={block.src} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:underline">
                    {block.src}
                  </a>
                </div>
              </div>
            )}

            {block.type === 'quote' && (
              <blockquote className="border-l-4 border-teal-500 pl-4 italic text-gray-600 my-6">
                <p className="text-lg">{block.text}</p>
                {block.author && (
                  <cite className="block mt-2 text-sm text-gray-500 not-italic">— {block.author}</cite>
                )}
              </blockquote>
            )}

            {block.type === 'expandable' && (
              <div className="my-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">{block.text}</p>
              </div>
            )}

            {block.type === 'table' && (
              <div className="my-6 overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <tbody>
                    {block.rows.map((row, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        {row.map((cell, j) => (
                          <td key={j} className="py-2 px-4 text-gray-700">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
