import { useState } from 'react'
import { 
  BookOpen, 
  FileText, 
  Video, 
  Headphones,
  Download,
  ExternalLink,
  Search,
  Filter,
  ChevronRight,
  Star,
  Users
} from 'lucide-react'
import Header from '../navigation/Header'

interface Resource {
  id: number
  title: string
  description: string
  type: 'article' | 'video' | 'audio' | 'worksheet'
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  rating: number
  downloads?: number
  duration?: string
  thumbnail?: string
}

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'communication', label: 'Communication' },
    { id: 'discipline', label: 'Discipline' },
    { id: 'emotional', label: 'Emotional Health' },
    { id: 'development', label: 'Child Development' },
    { id: 'special', label: 'Special Needs' }
  ]

  const resourceTypes = [
    { id: 'all', label: 'All Types', icon: Filter },
    { id: 'article', label: 'Articles', icon: FileText },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'audio', label: 'Podcasts', icon: Headphones },
    { id: 'worksheet', label: 'Worksheets', icon: BookOpen }
  ]

  const resources: Resource[] = [
    {
      id: 1,
      title: 'Active Listening Techniques for Parents',
      description: 'Learn how to truly listen to your children and understand their needs effectively.',
      type: 'article',
      category: 'communication',
      difficulty: 'beginner',
      rating: 4.8,
      downloads: 1250
    },
    {
      id: 2,
      title: 'Positive Discipline Strategies',
      description: 'Evidence-based approaches to discipline that build rather than break relationships.',
      type: 'video',
      category: 'discipline',
      difficulty: 'intermediate',
      rating: 4.9,
      duration: '45 min'
    },
    {
      id: 3,
      title: 'Understanding Your Child\'s Emotional World',
      description: 'A deep dive into emotional development and how to support your child through big feelings.',
      type: 'audio',
      category: 'emotional',
      difficulty: 'beginner',
      rating: 4.7,
      duration: '32 min'
    },
    {
      id: 4,
      title: 'Family Communication Worksheet',
      description: 'Practical exercises to improve family communication and resolve conflicts peacefully.',
      type: 'worksheet',
      category: 'communication',
      difficulty: 'beginner',
      rating: 4.6,
      downloads: 890
    },
    {
      id: 5,
      title: 'Building Resilience in Children',
      description: 'Strategies to help your child develop emotional resilience and coping skills.',
      type: 'article',
      category: 'emotional',
      difficulty: 'intermediate',
      rating: 4.8,
      downloads: 2100
    },
    {
      id: 6,
      title: 'Child Development Milestones Guide',
      description: 'Comprehensive guide to understanding developmental stages from ages 0-18.',
      type: 'worksheet',
      category: 'development',
      difficulty: 'beginner',
      rating: 4.9,
      downloads: 3400
    },
    {
      id: 7,
      title: 'Parenting Children with ADHD',
      description: 'Specialized strategies for supporting children with attention and hyperactivity challenges.',
      type: 'video',
      category: 'special',
      difficulty: 'advanced',
      rating: 4.7,
      duration: '60 min'
    },
    {
      id: 8,
      title: 'The Art of Setting Boundaries',
      description: 'Learn to set healthy boundaries that respect both parent and child needs.',
      type: 'audio',
      category: 'discipline',
      difficulty: 'intermediate',
      rating: 4.8,
      duration: '28 min'
    }
  ]

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    const matchesType = selectedType === 'all' || resource.type === selectedType
    
    return matchesSearch && matchesCategory && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return FileText
      case 'video': return Video
      case 'audio': return Headphones
      case 'worksheet': return BookOpen
      default: return FileText
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700'
      case 'advanced': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-teal-600 to-blue-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Parenting Resources
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Explore our collection of articles, videos, worksheets, and podcasts to support your parenting journey.
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            {resourceTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center px-4 py-2 rounded-full font-medium transition-all ${
                  selectedType === type.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <type.icon className="w-4 h-4 mr-2" />
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredResources.length} Resources Found
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const TypeIcon = getTypeIcon(resource.type)
              
              return (
                <div
                  key={resource.id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden"
                >
                  {/* Thumbnail Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center relative">
                    <TypeIcon className="w-16 h-16 text-white/80" />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(resource.difficulty)}`}>
                        {resource.difficulty}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {resource.rating}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <TypeIcon className="w-4 h-4 text-teal-600 mr-2" />
                      <span className="text-sm text-teal-600 font-medium capitalize">{resource.type}</span>
                      {resource.duration && (
                        <span className="text-sm text-gray-500 ml-auto">{resource.duration}</span>
                      )}
                      {resource.downloads && (
                        <span className="text-sm text-gray-500 ml-auto">{resource.downloads} downloads</span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                      {resource.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {resource.description}
                    </p>

                    <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-teal-600 hover:text-white transition-colors font-medium">
                      {resource.type === 'worksheet' ? (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Resource
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Collections</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
              <BookOpen className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">New Parent Starter Kit</h3>
              <p className="text-teal-100 mb-4">Essential resources for first-time parents</p>
              <button className="flex items-center text-white font-medium hover:underline">
                Explore Collection <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <Users className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Family Communication</h3>
              <p className="text-blue-100 mb-4">Tools to improve family dialogue</p>
              <button className="flex items-center text-white font-medium hover:underline">
                Explore Collection <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <Star className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Expert Favorites</h3>
              <p className="text-purple-100 mb-4">Top-rated resources from our specialists</p>
              <button className="flex items-center text-white font-medium hover:underline">
                Explore Collection <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-gray-300 mb-8">
            Subscribe to our newsletter for weekly parenting tips and new resource updates.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500"
            />
            <button className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            &copy; 2024 Partners in Parenting. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
