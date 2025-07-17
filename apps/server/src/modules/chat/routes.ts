import express from 'express';
import { openai } from '@ai-sdk/openai';
import { streamText, tool, generateText } from 'ai';
import { z } from 'zod';
import { db } from '../../../db';
import { courses, lessons, categories } from '../../../db/schema';
import { eq, ilike, or, and } from 'drizzle-orm';

export const chatRoutes = express.Router();

// Verify OpenAI API key is loaded
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in environment variables');
} else {
  console.log('✅ OpenAI API key loaded successfully');
}

// Tool for getting all available courses
const getAllCoursesTool = tool({
  description: 'Get all available courses on the platform. Use this when user asks to see all courses, browse the course catalog, or wants a complete overview of available courses.',
  parameters: z.object({
    limit: z.number().optional().describe('Maximum number of courses to return (default: 50)'),
  }),
  execute: async ({ limit = 50 }) => {
    try {
      console.log('📚 Getting all courses with limit:', limit);
      
      const courseList = await db
        .select({
          id: courses.id,
          title: courses.title,
          description: courses.description,
          category: courses.category,
          level: courses.level,
          duration: courses.duration,
          rating: courses.rating,
          enrollmentCount: courses.enrollmentCount,
        })
        .from(courses)
        .orderBy(courses.rating, courses.enrollmentCount)
        .limit(limit);
      
      console.log(`📚 Found ${courseList.length} total courses`);
      
      return {
        courses: courseList,
        count: courseList.length,
        totalShowing: courseList.length,
        limit,
      };
    } catch (error) {
      console.error('Error getting all courses:', error);
      return { error: 'Failed to get all courses', courses: [], count: 0 };
    }
  },
});

// Tool for searching courses
const searchCoursesTool = tool({
  description: 'Search for courses by title, description, category, or level. Use this when user wants to find specific courses by keywords or filter by category/level.',
  parameters: z.object({
    query: z.string().optional().describe('The search term to look for in course titles, descriptions, and categories'),
    category: z.string().optional().describe('Filter by specific category if mentioned'),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional().describe('Filter by difficulty level if mentioned'),
    limit: z.number().optional().describe('Maximum number of courses to return (default: 20)'),
  }),
  execute: async ({ query, category, level, limit = 20 }) => {
    try {
      console.log('🔍 Searching courses with:', { query, category, level, limit });
      
      const conditions = [];
      
      // Text search across title, description, and category
      if (query) {
        conditions.push(
          or(
            ilike(courses.title, `%${query}%`),
            ilike(courses.description, `%${query}%`),
            ilike(courses.category, `%${query}%`)
          )
        );
      }
      
      // Additional filters
      if (category) conditions.push(eq(courses.category, category));
      if (level) conditions.push(eq(courses.level, level));
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      const courseList = await db
        .select({
          id: courses.id,
          title: courses.title,
          description: courses.description,
          category: courses.category,
          level: courses.level,
          duration: courses.duration,
          rating: courses.rating,
          enrollmentCount: courses.enrollmentCount,
        })
        .from(courses)
        .where(whereClause)
        .orderBy(courses.rating, courses.enrollmentCount)
        .limit(limit);
      
      console.log(`📚 Found ${courseList.length} courses`);
      
      return {
        courses: courseList,
        count: courseList.length,
        searchTerm: query,
        category,
        level,
        limit,
      };
    } catch (error) {
      console.error('Error searching courses:', error);
      return { error: 'Failed to search courses', courses: [], count: 0 };
    }
  },
});

// Tool for getting available lessons
const getLessonsTool = tool({
  description: 'Get available lessons, optionally filtered by course. Use this when user asks about lessons, course content, or what they can learn.',
  parameters: z.object({
    courseId: z.string().optional().describe('Filter lessons by specific course ID'),
    query: z.string().optional().describe('Search term to filter lessons by title or description'),
  }),
  execute: async ({ courseId, query }) => {
    try {
      console.log('📖 Getting lessons with:', { courseId, query });
      
      const conditions = [];
      
      if (courseId) {
        conditions.push(eq(lessons.courseId, courseId));
      }
      
      if (query) {
        conditions.push(
          or(
            ilike(lessons.title, `%${query}%`),
            ilike(lessons.description, `%${query}%`)
          )
        );
      }
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      const lessonList = await db
        .select({
          id: lessons.id,
          courseId: lessons.courseId,
          title: lessons.title,
          description: lessons.description,
          type: lessons.type,
          duration: lessons.duration,
          order: lessons.order,
          isFree: lessons.isFree,
        })
        .from(lessons)
        .where(whereClause)
        .orderBy(lessons.order)
        .limit(20);
      
      console.log(`📚 Found ${lessonList.length} lessons`);
      
      return {
        lessons: lessonList,
        count: lessonList.length,
        courseId,
        searchTerm: query,
      };
    } catch (error) {
      console.error('Error getting lessons:', error);
      return { error: 'Failed to get lessons', lessons: [], count: 0 };
    }
  },
});

// Tool for getting course categories
const getCategoresTool = tool({
  description: 'Get all available course categories. Use this when user asks about available topics, subjects, or course areas.',
  parameters: z.object({}),
  execute: async () => {
    try {
      console.log('🏷️ Getting course categories');
      
      const categoryList = await db
        .select({
          id: categories.id,
          name: categories.name,
          description: categories.description,
          icon: categories.icon,
        })
        .from(categories)
        .orderBy(categories.order, categories.name);
      
      console.log(`🏷️ Found ${categoryList.length} categories`);
      
      return {
        categories: categoryList,
        count: categoryList.length,
      };
    } catch (error) {
      console.error('❌ Error getting categories in tool:', error);
      return { error: 'Failed to get categories', categories: [], count: 0 };
    }
  },
});

// Chat endpoint using AI SDK v4
chatRoutes.post('/chat', async (req, res) => {
  try {
    const { messages, model = '4o-mini' } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    
    // Map model names to actual OpenAI model identifiers
    const modelMap = {
      '4o-mini': 'gpt-4o-mini',
    };
    
    const actualModel = modelMap[model as keyof typeof modelMap] || 'gpt-4o-mini';
    
    const result = await streamText({
      model: openai(actualModel),
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant for Sentry Academy, an online learning platform. You can help users:

1. Browse all available courses in the catalog
2. Search for courses by topic, category, or difficulty level
3. Find available lessons and course content
4. Explore different course categories
5. Answer general questions about learning and the platform

Key capabilities:
- Use getAllCourses to show all available courses when users want to browse the catalog
- Use searchCourses to find specific courses based on keywords, categories, or levels
- Use getLessons to show available lessons
- Use getCategories to show available subject areas
- Provide helpful, educational guidance

FORMATTING GUIDELINES for tool responses:
- Always use proper markdown formatting for better readability
- For course/lesson lists: Use bullet points with **bold titles** and brief descriptions
- For categories: Use a simple numbered or bulleted list
- Keep responses concise and well-structured
- Use headers (##) to organize sections
- Example format for courses:
  ## Available Courses
  • **Course Title** - Brief description (Level: beginner/intermediate/advanced)
  • **Another Course** - Description here

Be friendly, concise, and educational. Present information in a clean, scannable format optimized for a small chat window. You MUST ONLY respond to questions regarding the course platform and education. Do not respond to questions about other topics.`,
        },
        ...messages,
      ],
      tools: {
        getAllCourses: getAllCoursesTool,
        searchCourses: searchCoursesTool,
        getLessons: getLessonsTool,
        getCategories: getCategoresTool,
      },
      // maxTokens: 4096,
    });

    // Manual streaming approach for better reliability
    const dataStream = result.toDataStreamResponse();
    
    // Set headers that work with useChat
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Transfer-Encoding': 'chunked',
    });
    
    // Stream the response manually with proper error handling
    if (dataStream.body) {
      const reader = dataStream.body.getReader();
      const decoder = new TextDecoder();
      
      try {
        let chunk;
        while (!(chunk = await reader.read()).done) {
          const text = decoder.decode(chunk.value, { stream: true });
          res.write(text);
        }
      } catch (streamError) {
        console.error('❌ Streaming error:', streamError);
      } finally {
        reader.releaseLock();
        res.end();
      }
    } else {
      res.end();
    }
    
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ 
      error: 'Failed to process chat request', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

