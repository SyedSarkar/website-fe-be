import mongoose from 'mongoose';
import Course from './models/Course.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample courses based on different score ranges
const sampleCourses = [
  {
    title: 'Basic Parenting Skills',
    description: 'Fundamental parenting techniques for everyday situations with young children',
    estimatedDuration: '4 weeks',
    difficulty: 'Beginner',
    category: 'Parenting Skills',
    targetScoreRange: { min: 0, max: 15 },
    priority: 'Low',
    modules: [
      {
        title: 'Introduction to Positive Parenting',
        content: 'Learn the fundamentals of positive parenting and how it impacts child development...',
        order: 1,
        estimatedMinutes: 30
      },
      {
        title: 'Effective Communication',
        content: 'Discover how to communicate effectively with your children and understand their needs...',
        order: 2,
        estimatedMinutes: 45
      },
      {
        title: 'Setting Boundaries',
        content: 'Learn how to set healthy boundaries and enforce them consistently...',
        order: 3,
        estimatedMinutes: 40
      },
      {
        title: 'Positive Discipline',
        content: 'Understand positive discipline techniques that work without punishment...',
        order: 4,
        estimatedMinutes: 50
      },
      {
        title: 'Building Self-Esteem',
        content: 'Help your children develop healthy self-esteem and confidence...',
        order: 5,
        estimatedMinutes: 35
      }
    ]
  },
  {
    title: 'Stress Management for Parents',
    description: 'Practical stress management techniques specifically designed for busy parents',
    estimatedDuration: '3 weeks',
    difficulty: 'Beginner',
    category: 'Stress Management',
    targetScoreRange: { min: 0, max: 20 },
    priority: 'Low',
    modules: [
      {
        title: 'Understanding Parental Stress',
        content: 'Recognize the signs and sources of parental stress...',
        order: 1,
        estimatedMinutes: 25
      },
      {
        title: 'Quick Relaxation Techniques',
        content: 'Learn 5-minute relaxation techniques you can use anywhere...',
        order: 2,
        estimatedMinutes: 30
      },
      {
        title: 'Time Management Strategies',
        content: 'Effective time management to reduce parenting stress...',
        order: 3,
        estimatedMinutes: 40
      },
      {
        title: 'Building Support Systems',
        content: 'Create and maintain a strong support network...',
        order: 4,
        estimatedMinutes: 35
      }
    ]
  },
  {
    title: 'Advanced Communication Strategies',
    description: 'Enhanced communication techniques for challenging parenting situations',
    estimatedDuration: '6 weeks',
    difficulty: 'Intermediate',
    category: 'Communication',
    targetScoreRange: { min: 15, max: 25 },
    priority: 'Medium',
    modules: [
      {
        title: 'Active Listening Skills',
        content: 'Master the art of active listening with your children...',
        order: 1,
        estimatedMinutes: 45
      },
      {
        title: 'Conflict Resolution',
        content: 'Resolve conflicts constructively and peacefully...',
        order: 2,
        estimatedMinutes: 50
      },
      {
        title: 'Difficult Conversations',
        content: 'Handle sensitive topics with children of different ages...',
        order: 3,
        estimatedMinutes: 55
      },
      {
        title: 'Non-Verbal Communication',
        content: 'Understand and use non-verbal cues effectively...',
        order: 4,
        estimatedMinutes: 40
      },
      {
        title: 'Digital Age Communication',
        content: 'Navigate communication challenges in the digital world...',
        order: 5,
        estimatedMinutes: 45
      },
      {
        title: 'Family Meetings',
        content: 'Conduct productive family meetings that strengthen relationships...',
        order: 6,
        estimatedMinutes: 35
      }
    ]
  },
  {
    title: 'Child Mental Health Fundamentals',
    description: 'Understanding and supporting your child\'s mental health and emotional well-being',
    estimatedDuration: '8 weeks',
    difficulty: 'Intermediate',
    category: 'Mental Health',
    targetScoreRange: { min: 20, max: 30 },
    priority: 'High',
    modules: [
      {
        title: 'Child Development Basics',
        content: 'Understand normal child development milestones...',
        order: 1,
        estimatedMinutes: 60
      },
      {
        title: 'Recognizing Mental Health Issues',
        content: 'Identify early signs of mental health concerns...',
        order: 2,
        estimatedMinutes: 55
      },
      {
        title: 'Anxiety in Children',
        content: 'Help children manage anxiety and build resilience...',
        order: 3,
        estimatedMinutes: 50
      },
      {
        title: 'Building Emotional Intelligence',
        content: 'Teach children emotional awareness and regulation...',
        order: 4,
        estimatedMinutes: 45
      },
      {
        title: 'Supporting School Performance',
        content: 'Help children succeed academically while managing stress...',
        order: 5,
        estimatedMinutes: 40
      },
      {
        title: 'Social Skills Development',
        content: 'Foster healthy social development and friendships...',
        order: 6,
        estimatedMinutes: 45
      },
      {
        title: 'When to Seek Professional Help',
        content: 'Know when and how to access professional mental health services...',
        order: 7,
        estimatedMinutes: 35
      },
      {
        title: 'Creating a Supportive Home Environment',
        content: 'Build a home environment that promotes mental wellness...',
        order: 8,
        estimatedMinutes: 40
      }
    ]
  },
  {
    title: 'Crisis Intervention for Parents',
    description: 'Essential skills for handling parenting crises and emergency situations',
    estimatedDuration: '2 weeks',
    difficulty: 'Advanced',
    category: 'Mental Health',
    targetScoreRange: { min: 25, max: 50 },
    priority: 'High',
    modules: [
      {
        title: 'Identifying Crisis Situations',
        content: 'Recognize when a situation requires immediate intervention...',
        order: 1,
        estimatedMinutes: 40
      },
      {
        title: 'De-escalation Techniques',
        content: 'Learn proven techniques to de-escalate volatile situations...',
        order: 2,
        estimatedMinutes: 45
      },
      {
        title: 'Emergency Resources',
        content: 'Know where to turn for help in different types of crises...',
        order: 3,
        estimatedMinutes: 30
      },
      {
        title: 'Post-Crisis Support',
        content: 'Provide appropriate support after a crisis has been resolved...',
        order: 4,
        estimatedMinutes: 35
      }
    ]
  }
];

async function seedCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/parenting-platform');
    
    // Clear existing courses
    await Course.deleteMany({});
    console.log('Cleared existing courses');
    
    // Insert sample courses
    const insertedCourses = await Course.insertMany(sampleCourses);
    console.log(`Inserted ${insertedCourses.length} courses`);
    
    console.log('Courses seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
}

seedCourses();
