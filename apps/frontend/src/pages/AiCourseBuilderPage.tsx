import React, { useState } from 'react';
import { Plus, Sparkles, BookOpen, Clock, Users, Star } from 'lucide-react';
import CourseBuilderWizard from '../components/ai/CourseBuilderWizard';

const AiCourseBuilderPage: React.FC = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="text-blue-600" size={32} />
            AI Course Builder
          </h1>
          <p className="text-gray-600 mt-2">
            Create comprehensive courses using AI. Describe your topic and let AI design the perfect curriculum.
          </p>
        </div>
        <button
          onClick={() => setIsWizardOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Create New Course
        </button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Sparkles className="text-blue-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered</h3>
          <p className="text-gray-600 text-sm">
            Advanced AI analyzes your prompt to create structured, comprehensive course content.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="text-green-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Structured Lessons</h3>
          <p className="text-gray-600 text-sm">
            Automatically generates properly sequenced lessons with clear learning objectives.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Clock className="text-purple-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Time Efficient</h3>
          <p className="text-gray-600 text-sm">
            Create complete courses in minutes instead of hours with intelligent content generation.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <Star className="text-orange-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Quality</h3>
          <p className="text-gray-600 text-sm">
            Generate courses that match the quality and structure of professionally designed curricula.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Describe Your Course</h3>
            <p className="text-gray-600">
              Enter a detailed prompt describing what you want to teach, your target audience, and learning goals.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">2</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Generates Content</h3>
            <p className="text-gray-600">
              Our AI analyzes existing courses and creates a comprehensive curriculum with lessons and objectives.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Review & Publish</h3>
            <p className="text-gray-600">
              Preview your course, make any edits, and publish it to make it available to students.
            </p>
          </div>
        </div>
      </div>

      {/* Recent AI-Generated Courses */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent AI-Generated Courses</h2>
          <span className="text-sm text-gray-500">Coming soon...</span>
        </div>
        <div className="text-center py-12 text-gray-500">
          <Sparkles size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Your AI-generated courses will appear here once created.</p>
        </div>
      </div>

      {/* Course Builder Wizard Modal */}
      {isWizardOpen && (
        <CourseBuilderWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
        />
      )}
    </div>
  );
};

export default AiCourseBuilderPage;