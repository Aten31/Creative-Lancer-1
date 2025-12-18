import React, { useState, useEffect } from 'react';
import { FreelancerProfile, Category, Qualification } from '../types';
import { POSITIONS, CATEGORIES, QUALIFICATIONS } from '../constants';
import { generateBio } from '../services/geminiService';

interface PortfolioFormProps {
  initialData?: FreelancerProfile;
  userId: string;
  userName: string;
  onSubmit: (data: FreelancerProfile) => void;
  onCancel: () => void;
}

const PortfolioForm: React.FC<PortfolioFormProps> = ({ initialData, userId, userName, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<FreelancerProfile>>({
    name: userName,
    userId: userId,
    title: POSITIONS[0],
    category: CATEGORIES[0],
    hourlyRate: 1000,
    experienceYears: 0,
    qualification: QUALIFICATIONS[0],
    bio: '',
    skills: [],
    imageUrl: 'https://picsum.photos/400/400',
    resumeUrl: ''
  });

  const [skillsInput, setSkillsInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSkillsInput(initialData.skills.join(', '));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateBio = async () => {
    if (!formData.title) return;
    setIsGenerating(true);
    const bio = await generateBio(formData.title, Number(formData.experienceYears) || 0, skillsInput);
    setFormData(prev => ({ ...prev, bio }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(s => s !== '');
    
    // Construct final object
    const finalProfile: FreelancerProfile = {
      id: formData.id || Math.random().toString(36).substr(2, 9),
      userId: userId,
      name: formData.name!,
      title: formData.title!,
      category: formData.category as Category,
      hourlyRate: Number(formData.hourlyRate),
      experienceYears: Number(formData.experienceYears),
      qualification: formData.qualification as Qualification,
      rating: formData.rating || 1, // Will be recalculated by service
      bio: formData.bio || '',
      skills: skillsArray,
      imageUrl: formData.imageUrl,
      resumeUrl: formData.resumeUrl,
      createdAt: formData.createdAt || new Date().toISOString()
    };

    onSubmit(finalProfile);
  };

  const inputClass = "w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2 text-stone-800 focus:ring-2 focus:ring-stone-400 focus:border-stone-400 outline-none transition-all placeholder-stone-400";
  const labelClass = "block text-sm font-semibold text-stone-600 mb-1";

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto border border-stone-200">
      <h2 className="text-2xl font-bold text-stone-900 mb-6">
        {initialData ? 'Edit Portfolio' : 'Create Your Portfolio'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Position</label>
            <div className="relative">
              <select
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                <i className="fas fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Category & Qualification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={inputClass}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Qualification</label>
            <select
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              className={inputClass}
            >
              {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Hourly Rate (NPR)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-stone-400">Rs.</span>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                className={`${inputClass} pl-10`}
                min="0"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Experience (Years)</label>
            <input
              type="number"
              name="experienceYears"
              value={formData.experienceYears}
              onChange={handleChange}
              className={inputClass}
              min="0"
              max="50"
            />
          </div>
        </div>

        {/* Skills */}
        <div>
           <label className={labelClass}>Skills (comma separated)</label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. Photoshop, React, Sound Mixing"
              className={inputClass}
            />
        </div>

        {/* Bio with AI */}
        <div>
          <div className="flex justify-between items-center mb-1">
             <label className={labelClass}>Bio</label>
             <button
               type="button"
               onClick={handleGenerateBio}
               disabled={isGenerating}
               className="text-xs flex items-center bg-stone-800 hover:bg-stone-700 text-white px-2 py-1 rounded transition-colors"
             >
               {isGenerating ? <i className="fas fa-spinner fa-spin mr-1"></i> : <i className="fas fa-magic mr-1"></i>}
               Generate with AI
             </button>
          </div>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className={inputClass}
            placeholder="Tell us about yourself..."
          ></textarea>
        </div>

        {/* URLs */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Profile Image URL</label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
             <label className={labelClass}>Resume File (Simulated)</label>
             <div className="relative">
                <input 
                  type="file" 
                  className="block w-full text-sm text-stone-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-stone-800 file:text-white
                    hover:file:bg-stone-700
                    cursor-pointer
                  "
                  onChange={() => setFormData(prev => ({...prev, resumeUrl: 'simulated_resume.pdf'}))}
                />
             </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-stone-900 text-white font-bold hover:bg-stone-800 shadow-md transition-all transform hover:scale-[1.02]"
          >
            {initialData ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioForm;