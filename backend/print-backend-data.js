import mongoose from 'mongoose';
import User from './models/User.js';
import ModuleEnrollment from './models/ModuleEnrollment.js';
import CourseProgress from './models/CourseProgress.js';
import ScaleResponse from './models/ScaleResponse.js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

async function printBackendData() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Print Users
    console.log('👥 USERS:');
    console.log('=' .repeat(50));
    const users = await User.find().sort({ createdAt: -1 });
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log(`   Last Login: ${user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}`);
      console.log('');
    });

    // Print Module Enrollments
    console.log('\n📚 MODULE ENROLLMENTS:');
    console.log('=' .repeat(50));
    const enrollments = await ModuleEnrollment.find()
      .populate('user', 'name email')
      .sort({ enrolledAt: -1 });
    
    if (enrollments.length === 0) {
      console.log('No module enrollments found');
    } else {
      enrollments.forEach((enrollment, index) => {
        console.log(`${index + 1}. ${enrollment.user?.name || 'Unknown User'} - ${enrollment.moduleName}`);
        console.log(`   Module: ${enrollment.moduleSlug}`);
        console.log(`   Progress: ${enrollment.progress || 0}%`);
        console.log(`   Pages: ${enrollment.completedPages?.length || 0}/${enrollment.totalPages || 0} completed`);
        console.log(`   Status: ${enrollment.isCompleted ? '✅ Completed' : '📖 In Progress'}`);
        console.log(`   Enrolled: ${enrollment.enrolledAt.toLocaleDateString()}`);
        console.log('');
      });
    }

    // Print Course Progress
    console.log('\n🎯 COURSE PROGRESS:');
    console.log('=' .repeat(50));
    const courseProgress = await CourseProgress.find()
      .populate('user', 'name email')
      .populate('course', 'title')
      .sort({ enrolledAt: -1 });
    
    if (courseProgress.length === 0) {
      console.log('No course progress found');
    } else {
      courseProgress.forEach((progress, index) => {
        console.log(`${index + 1}. ${progress.user?.name || 'Unknown User'} - ${progress.course?.title || 'Unknown Course'}`);
        console.log(`   Progress: ${progress.progressPercentage || 0}%`);
        console.log(`   Status: ${progress.status || 'Not Started'}`);
        console.log(`   Current Module: ${progress.currentModule || 'None'}`);
        console.log(`   Completed Modules: ${progress.completedModules?.length || 0}`);
        console.log(`   Enrolled: ${progress.enrolledAt.toLocaleDateString()}`);
        if (progress.completedAt) {
          console.log(`   Completed: ${progress.completedAt.toLocaleDateString()}`);
        }
        console.log('');
      });
    }

    // Print Scale Responses (Assessments)
    console.log('\n📊 SCALE RESPONSES (ASSESSMENTS):');
    console.log('=' .repeat(50));
    const scaleResponses = await ScaleResponse.find()
      .populate('user', 'name email')
      .sort({ completedAt: -1 });
    
    if (scaleResponses.length === 0) {
      console.log('No scale responses found');
    } else {
      scaleResponses.forEach((response, index) => {
        console.log(`${index + 1}. ${response.user?.name || 'Unknown User'} - ${response.scaleName}`);
        console.log(`   Total Score: ${response.totalScore}`);
        console.log(`   Risk Level: ${response.riskLevel || 'Not Calculated'}`);
        console.log(`   Time Taken: ${response.timeTaken ? Math.round(response.timeTaken / 60) + ' minutes' : 'Not recorded'}`);
        console.log(`   Completed: ${response.completedAt.toLocaleDateString()}`);
        console.log('');
      });
    }

    // Print Summary Statistics
    console.log('\n📈 SUMMARY STATISTICS:');
    console.log('=' .repeat(50));
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter(e => e.isCompleted).length;
    const totalAssessments = scaleResponses.length;
    const avgScore = scaleResponses.length > 0 
      ? Math.round(scaleResponses.reduce((sum, r) => sum + r.totalScore, 0) / scaleResponses.length)
      : 0;

    console.log(`Total Users: ${totalUsers} (${adminUsers} admins, ${regularUsers} regular users)`);
    console.log(`Module Enrollments: ${totalEnrollments} (${completedEnrollments} completed)`);
    console.log(`Assessments Taken: ${totalAssessments}`);
    console.log(`Average Assessment Score: ${avgScore}`);
    
    // Risk Level Distribution
    const riskLevels = scaleResponses.reduce((acc, response) => {
      const level = response.riskLevel || 'Unknown';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nRisk Level Distribution:');
    Object.entries(riskLevels).forEach(([level, count]) => {
      console.log(`  ${level}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the function
printBackendData();
