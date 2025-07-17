import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Users, Clock, Tag, Target, Loader2, Edit, Eye, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Course, Lesson } from '../../types';
import { api } from '../../services/api';

interface CourseBuilderWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GeneratedCourse {
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  tags: string[];
  prerequisites: string[];
  learningObjectives: string[];
  lessons: Omit<Lesson, 'id' | 'completed'>[];
}

type WizardStep = 'prompt' | 'generating' | 'preview' | 'editing' | 'success';

const CourseBuilderWizard: React.FC<CourseBuilderWizardProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<WizardStep>('prompt');
  const [prompt, setPrompt] = useState('');
  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedCourse, setEditedCourse] = useState<GeneratedCourse | null>(null);

  if (!isOpen) return null;

  const handleGenerateCourse = async () => {
    if (!prompt.trim()) return;

    setCurrentStep('generating');
    
    try {
      const result = await api.ai.generateCourse({ 
        prompt, 
        instructorId: user?.id 
      });
      
      // Check if the AI tool successfully created the course
      if (result.success) {
        // Course was created directly by AI tool - show success
        setCurrentStep('success');
        setTimeout(() => {
          onClose();
          window.location.href = '/courses';
        }, 2000);
      } else {
        throw new Error(result.details || 'AI failed to create course');
      }
    } catch (error) {
      console.error('Error generating course:', error);
      alert(`Failed to generate course: ${error instanceof Error ? error.message : 'Please try again.'}`);
      setCurrentStep('prompt');
    }
  };

  const handleSubmitCourse = async () => {
    if (!editedCourse) return;

    setIsSubmitting(true);
    
    try {
      await api.courses.create({
        ...editedCourse,
        instructorId: user?.id,
      });

      setCurrentStep('success');
      setTimeout(() => {
        onClose();
        window.location.href = '/courses';
      }, 2000);
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'prompt':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Describe Your Course</h3>
              <p className="text-gray-600 mb-4">
                Provide a detailed description of the course you want to create. Include the topic, target audience, learning goals, and any specific requirements.
              </p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Example: Create a comprehensive course on React.js for beginners. The course should cover fundamental concepts like components, state, props, hooks, and routing. Include practical projects and hands-on exercises. Target audience is developers with basic JavaScript knowledge who want to learn modern React development."
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Tips for better results:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be specific about the target audience and their skill level</li>
                <li>• Mention any prerequisites or required knowledge</li>
                <li>• Include learning objectives or what students should achieve</li>
                <li>• Specify if you want hands-on projects or practical exercises</li>
                <li>• Mention the depth and scope of coverage you want</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateCourse}
                disabled={!prompt.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <Sparkles size={16} />
                Generate Course
              </button>
            </div>
          </div>
        );

      case 'generating':
        return (
          <div className="text-center py-12">
            <div className="animate-spin text-blue-600 mb-6">
              <Loader2 size={48} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Your Course</h3>
            <p className="text-gray-600 mb-4">
              Our AI is analyzing your requirements and creating a comprehensive course structure...
            </p>
            <div className="bg-gray-100 rounded-lg p-4 max-w-md mx-auto">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  Analyzing course requirements
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-300"></div>
                  Structuring curriculum
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-700"></div>
                  Creating lesson content
                </div>
              </div>
            </div>
          </div>
        );

      case 'preview':
      case 'editing':
        if (!editedCourse) return null;
        
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Course Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentStep(currentStep === 'preview' ? 'editing' : 'preview')}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {currentStep === 'preview' ? <Edit size={14} /> : <Eye size={14} />}
                  {currentStep === 'preview' ? 'Edit' : 'Preview'}
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              {/* Course Header */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                  {currentStep === 'editing' ? (
                    <input
                      type="text"
                      value={editedCourse.title}
                      onChange={(e) => setEditedCourse({ ...editedCourse, title: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900">{editedCourse.title}</h2>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  {currentStep === 'editing' ? (
                    <textarea
                      value={editedCourse.description}
                      onChange={(e) => setEditedCourse({ ...editedCourse, description: e.target.value })}
                      className="w-full h-24 p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-600">{editedCourse.description}</p>
                  )}
                </div>

                {/* Course Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    {currentStep === 'editing' ? (
                      <input
                        type="text"
                        value={editedCourse.category}
                        onChange={(e) => setEditedCourse({ ...editedCourse, category: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        <Tag size={12} className="mr-1" />
                        {editedCourse.category}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    {currentStep === 'editing' ? (
                      <select
                        value={editedCourse.level}
                        onChange={(e) => setEditedCourse({ ...editedCourse, level: e.target.value as any })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm capitalize">
                        <Users size={12} className="mr-1" />
                        {editedCourse.level}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    {currentStep === 'editing' ? (
                      <input
                        type="text"
                        value={editedCourse.duration}
                        onChange={(e) => setEditedCourse({ ...editedCourse, duration: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        <Clock size={12} className="mr-1" />
                        {editedCourse.duration}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lessons</label>
                    <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      <BookOpen size={12} className="mr-1" />
                      {editedCourse.lessons.length} lessons
                    </span>
                  </div>
                </div>
              </div>

              {/* Learning Objectives */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Target size={16} />
                  Learning Objectives
                </h4>
                <ul className="space-y-1">
                  {editedCourse.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lessons */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Course Lessons</h4>
                <div className="space-y-3">
                  {editedCourse.lessons.map((lesson, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">
                            Lesson {index + 1}: {lesson.title}
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                              {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
                            </span>
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                              {lesson.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setCurrentStep('prompt')}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                Back to Prompt
              </button>
              <button
                onClick={handleSubmitCourse}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Create Course
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-12">
            <div className="text-green-600 mb-6">
              <Check size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Course Created Successfully!</h3>
            <p className="text-gray-600 mb-4">
              Your AI-generated course has been created and published directly to the course catalog using advanced AI tools.
            </p>
            <p className="text-sm text-gray-500">Redirecting to courses page...</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="text-blue-600" size={28} />
            AI Course Builder
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default CourseBuilderWizard;