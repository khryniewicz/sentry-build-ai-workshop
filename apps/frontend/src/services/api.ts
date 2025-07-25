
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new ApiError(response.status, error.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Network error: Unable to connect to the server');
  }
}

export const api = {
  // Courses
  courses: {
    getAll: (params?: { category?: string; level?: string; featured?: string }) => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchApi<any[]>(`/courses${queryString}`);
    },
    getById: (id: string) => fetchApi<any>(`/courses/${id}`),
    create: (data: any) => fetchApi<any>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchApi<any>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    getCategories: () => fetchApi<any[]>('/courses/categories'),
  },

  // Lessons
  lessons: {
    getByCourse: (courseId: string) => fetchApi<any[]>(`/lessons/course/${courseId}`),
    getById: (id: string) => fetchApi<any>(`/lessons/${id}`),
    create: (data: any) => fetchApi<any>('/lessons', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchApi<any>(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    markComplete: (id: string) => fetchApi<any>(`/lessons/${id}/complete`, {
      method: 'POST',
    }),
  },

  // Users
  users: {
    getProfile: () => fetchApi<any>('/users/me'),
    updateProfile: (data: any) => fetchApi<any>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    getEnrollments: () => fetchApi<any[]>('/users/me/enrollments'),
  },

  // TOFIX Module 3: Broken enrollments missing userId
  enrollments: {
    create: (courseId: string, userId: string | undefined) => 
      fetchApi<any>('/enrollments', {
        method: 'POST',
        body: JSON.stringify({ courseId, userId }),
      }),
    getUserEnrollments: (userId: string) => fetchApi<any[]>(`/enrollments/user/${userId}`),
    getProgress: (enrollmentId: string) => fetchApi<any>(`/enrollments/${enrollmentId}/progress`),
    delete: (enrollmentId: string) => fetchApi<any>(`/enrollments/${enrollmentId}`, {
      method: 'DELETE',
    }),
  },

  // Search
  search: {
    // TOFIX Module 2: Frontend sends 'query' parameter but backend API expects 'q'
    // Backend documented API: GET /search/courses?q=searchTerm
    // Frontend mistakenly sends: GET /search/courses?query=searchTerm
    // Fix: Change 'query' to 'q' to match backend API contract
    courses: (query: string) => 
      fetchApi<any[]>(`/search/courses?query=${encodeURIComponent(query)}`),
  },

  // AI Course Generation
  ai: {
    generateCourse: (data: { prompt: string; instructorId?: string }) => 
      fetchApi<any>('/ai/generate-course', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getStats: () => fetchApi<any>('/ai/stats'),
  },
};

export type { ApiError };
