import express from 'express';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { db } from '../../../db';
import { courses, lessons as lessonsTable, categories, users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export const aiRoutes = express.Router();

// Course thumbnail images from seed data
const COURSE_THUMBNAILS = [
  'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg',
  'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg',
  'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
  'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg',
  'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
  'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg',
  'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg',
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
];

// Function to get a random thumbnail
const getRandomThumbnail = () => {
  return COURSE_THUMBNAILS[Math.floor(Math.random() * COURSE_THUMBNAILS.length)];
};

// Function to get a random instructor from available instructors
const getRandomInstructor = async () => {
  const instructors = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, 'instructor'));
  
  if (instructors.length === 0) {
    throw new Error('No instructors found in the database');
  }
  
  return instructors[Math.floor(Math.random() * instructors.length)].id;
};

// Verify OpenAI API key is loaded
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in environment variables');
} else {
  console.log('✅ OpenAI API key loaded successfully for AI course generation');
}

// Tool for creating a complete course with lessons
const createCourseTool = tool({
  description: 'Create a comprehensive course with lessons based on educational requirements. Use this when generating a complete course structure with curriculum design.',
  parameters: z.object({
    title: z.string().describe('Course title (50-80 characters)'),
    description: z.string().describe('Detailed course description (150-300 words)'),
    category: z.string().describe('Course category'),
    level: z.enum(['beginner', 'intermediate', 'advanced']).describe('Difficulty level'),
    duration: z.string().describe('Total course duration (e.g., "8 hours")'),
    tags: z.array(z.string()).describe('Relevant tags for discoverability'),
    prerequisites: z.array(z.string()).describe('Required knowledge or skills'),
    learningObjectives: z.array(z.string()).describe('What students will learn'),
    lessons: z.array(z.object({
      title: z.string().describe('Lesson title'),
      description: z.string().describe('Lesson description (50-150 words)'),
      type: z.enum(['video', 'text', 'quiz', 'assignment']).describe('Lesson type'),
      duration: z.string().describe('Lesson duration (e.g., "45 min")'),
      content: z.string().describe('Brief outline of lesson content'),
    })).describe('Array of course lessons in sequential order'),
    instructorId: z.string().describe('ID of the instructor creating the course'),
  }),
  execute: async ({ 
    title, 
    description, 
    category, 
    level, 
    duration, 
    tags, 
    prerequisites, 
    learningObjectives, 
    lessons, 
    instructorId 
  }) => {
    try {
      console.log('🤖 AI Tool: Creating course with lessons:', title);
      
      // Get a random instructor from available instructors (same pattern as thumbnails)
      const validInstructorId = await getRandomInstructor();
      console.log(`🤖 AI Tool: Using random instructor ID: ${validInstructorId}`);
      
      const courseId = createId();
      const baseSlug = title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      // Add course ID suffix to ensure uniqueness
      const slug = `${baseSlug}-${courseId.slice(-8)}`;

      // Create the course
      console.log(`🤖 AI Tool: About to insert course with data:`, {
        id: courseId,
        title,
        slug,
        description: description.substring(0, 100) + '...',
        instructorId: validInstructorId,
        category,
        level,
        duration,
      });
      
      const newCourse = await db
        .insert(courses)
        .values({
          id: courseId,
          title,
          slug,
          description,
          instructorId: validInstructorId,
          thumbnail: getRandomThumbnail(),
          category,
          tags,
          level,
          duration,
          price: '0',
          prerequisites,
          learningObjectives,
          status: 'published',
        })
        .returning();

      console.log(`🤖 AI Tool: Course insert returned:`, newCourse);
      
      if (!newCourse || newCourse.length === 0) {
        throw new Error('Course creation failed - no data returned from database');
      }

      // Create the lessons (only if course creation succeeded)
      if (lessons && lessons.length > 0) {
        console.log(`🤖 AI Tool: Preparing ${lessons.length} lessons for course`);
        
        const lessonsToInsert = lessons.map((lesson, index) => {
          const lessonData = {
            id: createId(),
            courseId: courseId,
            title: lesson.title,
            slug: lesson.title
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '') + `-${createId().slice(-8)}`,
            description: lesson.description,
            type: lesson.type,
            content: lesson.content,
            duration: lesson.duration,
            order: index + 1,
            isFree: index === 0, // Make first lesson free
          };
          console.log(`🤖 AI Tool: Lesson ${index + 1} data:`, lessonData);
          return lessonData;
        });

        console.log(`🤖 AI Tool: Creating ${lessonsToInsert.length} lessons for course`);
        
        try {
          await db.insert(lessonsTable).values(lessonsToInsert);
          console.log(`🤖 AI Tool: Lessons created successfully`);
        } catch (lessonError) {
          console.error(`🤖 AI Tool: Error creating lessons:`, lessonError);
          throw new Error(`Failed to create lessons: ${lessonError instanceof Error ? lessonError.message : 'Unknown error'}`);
        }
      }

      const lessonsCount = lessons ? lessons.length : 0;
      console.log(`✅ AI Tool: Successfully created course "${title}" with ${lessonsCount} lessons`);
      console.log('Created course data:', JSON.stringify(newCourse[0], null, 2));
      
      return {
        success: true,
        course: newCourse[0],
        lessonsCreated: lessonsCount,
        message: `Course "${title}" has been successfully created and published with ${lessonsCount} lessons.`
      };
    } catch (error) {
      console.error('❌ AI Tool: Error creating course:', error);
      console.error('Error details:', error instanceof Error ? error.stack : error);
      return { 
        success: false, 
        error: 'Failed to create course', 
        message: error instanceof Error ? error.message : 'Unknown error occurred while creating course'
      };
    }
  },
});

// Schema for course generation request
const generateCourseSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  instructorId: z.string().optional(),
});


// Generate course using AI with tool calls
aiRoutes.post('/ai/generate-course', async (req, res) => {
  try {
    const { prompt, instructorId } = generateCourseSchema.parse(req.body);
    
    console.log('🤖 Generating course with AI for prompt:', prompt.substring(0, 100) + '...');

    // Get existing courses and categories for context
    const existingCourses = await db
      .select({
        title: courses.title,
        description: courses.description,
        category: courses.category,
        level: courses.level,
        duration: courses.duration,
      })
      .from(courses)
      .limit(10);

    const existingCategories = await db
      .select({
        name: categories.name,
        description: categories.description,
      })
      .from(categories);

    const systemPrompt = `You are an expert educational course designer for Sentry Academy. Your task is to analyze course requirements and create comprehensive courses using the createCourse tool.

CONTEXT - Existing courses for reference:
${existingCourses.map(course => `- "${course.title}" (${course.category}, ${course.level}): ${course.description.substring(0, 100)}...`).join('\n')}

Available categories: ${existingCategories.map(cat => cat.name).join(', ')}

INSTRUCTIONS:
1. Analyze the user's prompt to understand the topic, target audience, and learning goals
2. Design a course that matches the quality and structure of existing courses
3. Create 5-12 lessons that build upon each other logically
4. Use appropriate lesson types: mostly video/text, some quizzes/assignments
5. Estimate realistic durations (courses: 2-20 hours, lessons: 10-90 minutes)
6. Include comprehensive learning objectives and prerequisites
7. Choose existing categories or suggest new ones
8. Make lessons practical and hands-on when possible

IMPORTANT: You MUST use the createCourse tool to actually create the course. Do not just provide a description - use the tool to create it in the database.`;

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Create a comprehensive course based on this prompt: "${prompt}". The instructor ID is: ${instructorId || 'unknown'}`,
        },
      ],
      tools: {
        createCourse: createCourseTool,
      },
      // maxTokens: 4000,
      temperature: 0.7,
    });

    // Collect the result
    let courseCreated = false;
    let courseData = null;
    let aiResponse = '';

    for await (const chunk of result.fullStream) {
      if (chunk.type === 'text-delta') {
        aiResponse += chunk.textDelta;
      } else if (chunk.type === 'tool-result') {
        if (chunk.toolName === 'createCourse') {
          courseCreated = true;
          courseData = chunk.result;
        }
      }
    }

    if (courseCreated && courseData?.success) {
      console.log('✅ Successfully generated and created course via AI tool');
      res.json({
        success: true,
        course: courseData.course,
        message: courseData.message,
        aiResponse: aiResponse.trim(),
      });
    } else {
      console.error('❌ AI did not create course or creation failed');
      console.error('Course data received:', JSON.stringify(courseData, null, 2));
      console.error('AI response:', aiResponse);
      res.status(500).json({ 
        error: 'Failed to create course', 
        details: courseData?.message || courseData?.error || 'AI did not call the createCourse tool',
        aiResponse: aiResponse.trim(),
        debugInfo: courseData,
      });
    }
  } catch (error) {
    console.error('❌ Error generating course:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate course', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get AI course generation statistics (optional endpoint)
aiRoutes.get('/ai/stats', async (req, res) => {
  try {
    // This could track AI-generated courses in the future
    // For now, return basic stats
    const totalCourses = await db
      .select({ count: courses.id })
      .from(courses);

    res.json({
      totalCourses: totalCourses.length,
      aiGeneratedCourses: 0, // Would need to track this in the future
      message: 'AI course generation is operational',
    });
  } catch (error) {
    console.error('❌ Error getting AI stats:', error);
    res.status(500).json({ error: 'Failed to get AI stats' });
  }
});

export default aiRoutes;