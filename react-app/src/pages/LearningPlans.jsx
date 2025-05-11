/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { Plus, Edit2, Trash2, Calendar, CheckCircle } from 'lucide-react';

const LearningPlans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  
  // Form state
  const [topic, setTopic] = useState('');
  const [resources, setResources] = useState('');
  const [timeline, setTimeline] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/learning-plans');
      setPlans(response.data);
    } catch (err) {
      console.error('Error fetching learning plans:', err);
      setError('Failed to load learning plans');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTopic('');
    setResources('');
    setTimeline('');
    setStartDate('');
    setEndDate('');
    setTasks([]);
    setNewTask('');
    setNewTaskDueDate('');
    setEditingPlan(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      return;
    }
    
    try {
      const planData = {
        topic,
        resources,
        timeline,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        tasks: tasks.map(task => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null
        }))
      };

      if (editingPlan) {
        const response = await api.put(`/api/learning-plans/${editingPlan.id}`, planData);
        setPlans(plans.map(plan => plan.id === editingPlan.id ? response.data : plan));
      } else {
        const response = await api.post('/api/learning-plans', planData);
        setPlans([...plans, response.data]);
      }
      resetForm();
    } catch (err) {
      console.error('Error saving learning plan:', err);
      alert('Failed to save learning plan');
    }
  };

  const handleEdit = (plan) => {
    setTopic(plan.topic);
    setResources(plan.resources);
    setTimeline(plan.timeline);
    setStartDate(plan.startDate ? new Date(plan.startDate).toISOString().split('T')[0] : '');
    setEndDate(plan.endDate ? new Date(plan.endDate).toISOString().split('T')[0] : '');
    setTasks(plan.tasks.map(task => ({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null
    })));
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this learning plan?')) {
      return;
    }
    
    try {
      await api.delete(`/api/learning-plans/${planId}`);
      setPlans(plans.filter(plan => plan.id !== planId));
    } catch (err) {
      console.error('Error deleting learning plan:', err);
      alert('Failed to delete learning plan');
    }
  };

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    
    setTasks([...tasks, {
      description: newTask,
      dueDate: newTaskDueDate,
      completed: false
    }]);
    setNewTask('');
    setNewTaskDueDate('');
  };

  const handleRemoveTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const response = await api.post(`/api/learning-plans/tasks/${taskId}/complete`);
      setPlans(plans.map(plan => ({
        ...plan,
        tasks: plan.tasks.map(task => 
          task.id === taskId ? response.data : task
        )
      })));
    } catch (err) {
      console.error('Error completing task:', err);
      alert('Failed to complete task');
    }
  };

  const handleExtendPlan = async (planId, currentEndDate) => {
    const newEndDate = prompt('Enter new end date (YYYY-MM-DD)', 
      new Date(new Date(currentEndDate).getTime() + 7*24*60*60*1000).toISOString().split('T')[0]);
    
    if (!newEndDate) return;

    try {
      const response = await api.post(`/api/learning-plans/${planId}/extend`, newEndDate);
      setPlans(plans.map(plan => plan.id === planId ? response.data : plan));
    } catch (err) {
      console.error('Error extending plan:', err);
      alert('Failed to extend plan');
    }
  };

  const getProgress = (tasks) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Learning Plans</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md"
        >
          <Plus size={20} className="mr-2" />
          Create New Plan
        </button>
      </div>
      
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-300">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {editingPlan ? 'Edit Learning Plan' : 'Create New Learning Plan'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1.5">
                Topic/Skill
              </label>
              <input
                type="text"
                id="topic"
                placeholder="What do you want to learn?"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="resources" className="block text-sm font-medium text-gray-700 mb-1.5">
                Resources
              </label>
              <textarea
                id="resources"
                placeholder="Books, courses, websites, etc."
                rows="4"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                value={resources}
                onChange={(e) => setResources(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1.5">
                Timeline
              </label>
              <input
                type="text"
                id="timeline"
                placeholder="When do you plan to complete this?"
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tasks
              </label>
              <div className="space-y-3 mb-4">
                {tasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <input
                      type="text"
                      value={task.description}
                      onChange={(e) => {
                        const newTasks = [...tasks];
                        newTasks[index].description = e.target.value;
                        setTasks(newTasks);
                      }}
                      className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="date"
                      value={task.dueDate || ''}
                      onChange={(e) => {
                        const newTasks = [...tasks];
                        newTasks[index].dueDate = e.target.value;
                        setTasks(newTasks);
                      }}
                      className="p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(index)}
                      className="p-2 text-red-500 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="New task"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Add Task
                </button>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md"
              >
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-3 text-gray-600 text-lg">Loading your learning plans...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button 
            onClick={fetchPlans}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-gray-600 text-lg">No learning plans yet. Create one to start your learning journey!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div 
              key={plan.id} 
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{plan.topic}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-2 text-gray-500 hover:text-indigo-600 transition-colors duration-200"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors duration-200"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Progress</h3>
                  <div className="mt-1 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${getProgress(plan.tasks)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {plan.tasks.filter(task => task.completed).length}/{plan.tasks.length} tasks completed
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-600">Resources</h3>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{plan.resources || 'None specified'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Timeline</h3>
                  <p className="text-gray-700 text-sm">{plan.timeline || 'None specified'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-600">Period</h3>
                  <p className="text-gray-700 text-sm">
                    {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'Not set'} - 
                    {plan.endDate ? new Date(plan.endDate).toLocaleDateString() : 'Not set'}
                    {plan.endDate && (
                      <button
                        onClick={() => handleExtendPlan(plan.id, plan.endDate)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                      >
                        <Calendar size={16} className="inline mr-1" />
                        Extend
                      </button>
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-600">Tasks</h3>
                  {plan.tasks.length === 0 ? (
                    <p className="text-gray-700 text-sm">No tasks added</p>
                  ) : (
                    <ul className="space-y-2 mt-2">
                      {plan.tasks.map(task => (
                        <li 
                          key={task.id} 
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            disabled={task.completed}
                            className={`p-1 ${task.completed ? 'text-green-500' : 'text-gray-500 hover:text-green-500 transition-colors duration-200'}`}
                          >
                            <CheckCircle size={18} />
                          </button>
                          <span className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-700'} text-sm flex-1`}>
                            {task.description}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-gray-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-500 flex justify-between items-center">
                <span>Created {new Date(plan.createdAt).toLocaleDateString()}</span>
                {plan.extended && (
                  <span className="text-indigo-500 font-medium">Extended</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningPlans;