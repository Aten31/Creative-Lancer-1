import React from 'react';
import { FreelancerProfile, Category } from '../types';

interface PortfolioCardProps {
  profile: FreelancerProfile;
  isOwner?: boolean;
  onEdit?: (profile: FreelancerProfile) => void;
  onDelete?: (id: string) => void;
  onView?: (profile: FreelancerProfile) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ profile, isOwner, onEdit, onDelete, onView }) => {
  // Color coding based on category (Subtle pastel backgrounds)
  const getCategoryColor = (cat: Category) => {
    switch (cat) {
      case Category.ARTS: return 'text-rose-600 bg-rose-50 border-rose-100';
      case Category.DESIGNERS: return 'text-cyan-700 bg-cyan-50 border-cyan-100';
      case Category.MOTION_GRAPHICS: return 'text-violet-600 bg-violet-50 border-violet-100';
      case Category.SOUND: return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-stone-500 bg-stone-50';
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<i key={i} className="fas fa-star text-amber-400 text-xs"></i>);
      } else if (i - 0.5 <= rating) {
        stars.push(<i key={i} className="fas fa-star-half-alt text-amber-400 text-xs"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-stone-300 text-xs"></i>);
      }
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-stone-200 transition-all duration-300 transform hover:-translate-y-1 group flex flex-col h-full">
      {/* Image Header */}
      <div className="h-48 overflow-hidden relative cursor-pointer" onClick={() => onView?.(profile)}>
        <img 
          src={profile.imageUrl || 'https://picsum.photos/400/300'} 
          alt={profile.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
        />
        <div className="absolute top-3 right-3">
           <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getCategoryColor(profile.category)} shadow-sm`}>
             {profile.category}
           </span>
        </div>
        {/* Actions for owner */}
        {isOwner && (
          <div className="absolute top-0 left-0 p-2 flex space-x-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onEdit?.(profile)}
              className="bg-white/90 hover:bg-stone-900 hover:text-white text-stone-700 p-2 rounded-full shadow-md transition-colors border border-stone-200"
            >
              <i className="fas fa-edit text-xs"></i>
            </button>
            <button 
              onClick={() => onDelete?.(profile.id)}
              className="bg-white/90 hover:bg-red-600 hover:text-white text-red-500 p-2 rounded-full shadow-md transition-colors border border-stone-200"
            >
              <i className="fas fa-trash text-xs"></i>
            </button>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-white text-stone-900 font-medium px-4 py-2 rounded-full shadow-lg text-sm transform scale-90 group-hover:scale-100 transition-transform">View Profile</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 
                className="text-lg font-bold text-stone-900 group-hover:text-stone-600 transition-colors cursor-pointer"
                onClick={() => onView?.(profile)}
            >
                {profile.name}
            </h3>
            <p className="text-stone-500 text-sm font-medium">{profile.title}</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex space-x-1 mb-1">{renderStars(profile.rating)}</div>
          </div>
        </div>

        <p className="text-stone-500 text-sm line-clamp-2 mb-4 h-10 leading-relaxed">
          {profile.bio || "No bio available."}
        </p>

        <div className="flex flex-wrap gap-2 mb-4 mt-auto">
          {profile.skills.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="bg-stone-100 text-stone-600 border border-stone-200 px-2 py-1 rounded text-xs font-medium">
              {skill}
            </span>
          ))}
          {profile.skills.length > 3 && (
            <span className="bg-stone-100 text-stone-600 border border-stone-200 px-2 py-1 rounded text-xs">+{profile.skills.length - 3}</span>
          )}
        </div>

        <div className="pt-4 border-t border-stone-100 flex justify-between items-center mt-2">
          <div>
            <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Hourly Rate</span>
            <p className="text-stone-900 font-bold">NPR {profile.hourlyRate}</p>
          </div>
          <button 
            onClick={() => onView?.(profile)}
            className="text-stone-800 hover:text-stone-500 text-sm font-semibold transition-colors flex items-center"
          >
            View <i className="fas fa-arrow-right ml-1 text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;