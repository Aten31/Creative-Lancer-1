import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PortfolioCard from './components/PortfolioCard';
import PortfolioForm from './components/PortfolioForm';
import { FreelancerProfile, User, Category, JobApplication } from './types';
import { authService, portfolioService } from './services/mockDb';
import { CATEGORIES, POSITIONS } from './constants';

const App: React.FC = () => {
  // Navigation State
  const [currentPage, setCurrentPage] = useState('home');
  
  // Data State
  const [profiles, setProfiles] = useState<FreelancerProfile[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<FreelancerProfile | undefined>(undefined);
  const [selectedProfile, setSelectedProfile] = useState<FreelancerProfile | null>(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPosition, setFilterPosition] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<FreelancerProfile | undefined>(undefined);
  
  // Profile View Tab State
  const [profileTab, setProfileTab] = useState<'about' | 'resume'>('about');

  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Career Form State
  const [jobApp, setJobApp] = useState<Partial<JobApplication>>({ position: 'Platform Developer (React)' });
  const [appSubmitted, setAppSubmitted] = useState(false);
  const [useCustomPosition, setUseCustomPosition] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Initialization
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      
      const allProfiles = await portfolioService.getProfiles();
      setProfiles(allProfiles);

      if (currentUser) {
        const myProfile = await portfolioService.getMyProfile(currentUser.id);
        setUserProfile(myProfile);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  // --- Handlers ---

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setShowPortfolioForm(false);
    setAppSubmitted(false);
    setUseCustomPosition(false);
    setFileError(null);
    setSelectedProfile(null);
    // Reset career form data on nav
    setJobApp({ position: 'Platform Developer (React)' });
  };

  const handleViewProfile = (profile: FreelancerProfile) => {
    setSelectedProfile(profile);
    setProfileTab('about');
    setCurrentPage('profile-detail');
    window.scrollTo(0, 0);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (authMode === 'login') {
      const { user, error } = await authService.signIn(authEmail);
      if (error) setAuthError(error);
      else {
        setUser(user);
        const myProfile = await portfolioService.getMyProfile(user!.id);
        setUserProfile(myProfile);
        handleNavigate('home');
      }
    } else {
      const { user, error } = await authService.signUp(authEmail, authName);
      if (error) setAuthError(error);
      else {
        setUser(user);
        handleNavigate('home');
      }
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    setUser(null);
    setUserProfile(undefined);
    handleNavigate('home');
  };

  const handleSavePortfolio = async (data: FreelancerProfile) => {
    setIsLoading(true);
    const savedProfile = await portfolioService.upsertProfile(data);
    setUserProfile(savedProfile);
    
    // Refresh list
    const allProfiles = await portfolioService.getProfiles();
    setProfiles(allProfiles);
    
    setShowPortfolioForm(false);
    setEditingProfile(undefined);
    setIsLoading(false);
  };

  const handleDeletePortfolio = async (id: string) => {
    if (window.confirm("Are you sure you want to delete your portfolio?")) {
      await portfolioService.deleteProfile(id);
      setUserProfile(undefined);
      const allProfiles = await portfolioService.getProfiles();
      setProfiles(allProfiles);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fileError) return;
    await portfolioService.submitApplication(jobApp as JobApplication);
    setAppSubmitted(true);
    setJobApp({ position: 'Platform Developer (React)' });
    setUseCustomPosition(false);
    setFileError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // 2MB = 2 * 1024 * 1024 bytes
        if (file.size > 2 * 1024 * 1024) {
            setFileError("File size exceeds 2MB limit. Please upload a smaller file.");
            e.target.value = ""; // Clear the input
            setJobApp(prev => ({ ...prev, coverLetter: undefined }));
        } else {
            setFileError(null);
            // Simulating file upload by storing the filename
            setJobApp(prev => ({ ...prev, coverLetter: `[FILE] ${file.name}` }));
        }
    }
  };

  const commonInputClass = "w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-800 focus:ring-2 focus:ring-stone-400 outline-none transition-all";

  // --- Render Views ---

  const renderHome = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 mb-4 tracking-tight">
          Find the Perfect <span className="text-stone-500">Creative Lancer</span>
        </h1>
        <p className="text-stone-500 max-w-2xl mx-auto text-lg mb-8 font-light">
          Hire top-tier talent in Arts, Design, Motion Graphics, and Sound from Nepal's premier creative network.
        </p>
        
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
           {/* Text Search */}
           <div className="flex-grow relative">
              <i className="fas fa-search absolute left-3 top-3.5 text-stone-400"></i>
              <input 
                type="text"
                placeholder="Search by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-10 pr-4 py-3 text-stone-800 focus:ring-2 focus:ring-stone-400 outline-none"
              />
           </div>

           {/* Position Dropdown */}
           <div className="md:w-1/3 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                 <i className="fas fa-briefcase text-stone-400"></i>
              </div>
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-10 pr-8 py-3 text-stone-800 appearance-none focus:ring-2 focus:ring-stone-400 outline-none cursor-pointer"
              >
                <option value="All">All Positions</option>
                {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-400">
                <i className="fas fa-chevron-down text-xs"></i>
              </div>
           </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center mb-10 overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex space-x-2 bg-white p-1 rounded-full border border-stone-200 shadow-sm">
          <button
            onClick={() => setFilterCategory('All')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              filterCategory === 'All' ? 'bg-stone-800 text-white shadow-md' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                filterCategory === cat ? 'bg-stone-800 text-white shadow-md' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20"><i className="fas fa-circle-notch fa-spin text-4xl text-stone-400"></i></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {profiles
            .filter(p => {
                const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
                const matchesPosition = filterPosition === 'All' || p.title === filterPosition;
                const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      p.bio.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesCategory && matchesPosition && matchesSearch;
            })
            .map(profile => (
              <PortfolioCard 
                key={profile.id} 
                profile={profile} 
                onView={handleViewProfile}
              />
            ))}
        </div>
      )}
    </div>
  );

  const renderProfileDetail = () => {
    if (!selectedProfile) return null;

    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => handleNavigate('home')}
          className="mb-6 flex items-center text-stone-500 hover:text-stone-800 transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Explore
        </button>

        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-stone-200">
           {/* Profile Header */}
           <div className="bg-stone-50 p-8 flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-stone-100">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-md flex-shrink-0">
                 <img src={selectedProfile.imageUrl || 'https://picsum.photos/400/400'} alt={selectedProfile.name} className="w-full h-full object-cover" />
              </div>
              <div className="text-center md:text-left flex-grow">
                 <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-stone-900 mb-2 md:mb-0">{selectedProfile.name}</h1>
                    <span className="bg-stone-200 text-stone-700 px-3 py-1 rounded-full text-sm font-semibold">
                       {selectedProfile.category}
                    </span>
                 </div>
                 <h2 className="text-xl text-stone-500 mb-4">{selectedProfile.title}</h2>
                 
                 <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-stone-600 mb-6">
                    <div className="flex items-center">
                       <i className="fas fa-star text-amber-500 mr-2"></i>
                       <span>{selectedProfile.rating} Rating</span>
                    </div>
                     <div className="flex items-center">
                       <i className="fas fa-clock text-green-600 mr-2"></i>
                       <span>{selectedProfile.experienceYears} Years Exp.</span>
                    </div>
                     <div className="flex items-center">
                       <i className="fas fa-wallet text-stone-700 mr-2"></i>
                       <span>NPR {selectedProfile.hourlyRate} / hr</span>
                    </div>
                 </div>

                 <button className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                    Hire Me Now
                 </button>
              </div>
           </div>

           {/* Tabs */}
           <div className="flex border-b border-stone-200">
              <button 
                onClick={() => setProfileTab('about')}
                className={`flex-1 py-4 text-center font-medium transition-colors ${profileTab === 'about' ? 'text-stone-900 border-b-2 border-stone-900 bg-white' : 'text-stone-500 hover:text-stone-800 bg-stone-50'}`}
              >
                Inside View
              </button>
              <button 
                 onClick={() => setProfileTab('resume')}
                 className={`flex-1 py-4 text-center font-medium transition-colors ${profileTab === 'resume' ? 'text-stone-900 border-b-2 border-stone-900 bg-white' : 'text-stone-500 hover:text-stone-800 bg-stone-50'}`}
              >
                Resume Page
              </button>
           </div>

           {/* Content */}
           <div className="p-8 min-h-[400px]">
              {profileTab === 'about' ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                       <section>
                          <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center">
                             <i className="fas fa-user-circle text-stone-400 mr-3"></i> About Me
                          </h3>
                          <p className="text-stone-600 leading-relaxed text-lg">
                             {selectedProfile.bio}
                          </p>
                       </section>

                       <section>
                          <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center">
                             <i className="fas fa-tools text-stone-400 mr-3"></i> Skills & Expertise
                          </h3>
                          <div className="flex flex-wrap gap-3">
                             {selectedProfile.skills.map(skill => (
                                <span key={skill} className="bg-stone-100 border border-stone-200 text-stone-700 px-4 py-2 rounded-lg">
                                   {skill}
                                </span>
                             ))}
                          </div>
                       </section>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                           <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Qualification</h4>
                           <div className="flex items-center">
                              <i className="fas fa-graduation-cap text-stone-600 text-2xl mr-3"></i>
                              <span className="text-stone-900 font-medium text-lg">{selectedProfile.qualification}</span>
                           </div>
                        </div>

                         <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
                           <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Availability</h4>
                           <div className="flex items-center text-green-600">
                              <i className="fas fa-check-circle mr-2"></i>
                              <span className="font-medium">Available for Work</span>
                           </div>
                           <p className="text-xs text-stone-400 mt-2">Last active: 2 hours ago</p>
                        </div>
                    </div>
                 </div>
              ) : (
                 <div className="bg-stone-100 rounded-lg shadow-inner overflow-hidden min-h-[600px] relative border border-stone-200">
                    {/* Simulated PDF/Resume View */}
                    <div className="absolute inset-0 bg-stone-200/50 flex flex-col items-center py-8 overflow-y-auto">
                       {/* Resume Paper */}
                       <div className="bg-white w-[800px] shadow-xl min-h-[1000px] p-12 text-stone-900">
                          <div className="flex justify-between items-start border-b-2 border-stone-900 pb-8 mb-8">
                             <div>
                                <h1 className="text-4xl font-serif font-bold text-stone-900 mb-1">{selectedProfile.name}</h1>
                                <p className="text-xl text-stone-600 font-medium">{selectedProfile.title}</p>
                             </div>
                             <div className="text-right text-sm text-stone-500">
                                <p>{user?.email || 'email@example.com'}</p>
                                <p>Kathmandu, Nepal</p>
                             </div>
                          </div>
                       
                          <div className="space-y-8 font-serif">
                             <section>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-3">Professional Summary</h3>
                                <p className="text-stone-700 leading-relaxed text-justify">{selectedProfile.bio}</p>
                             </section>

                             <section>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-3">Experience</h3>
                                <div className="mb-4">
                                   <div className="flex justify-between font-bold text-stone-800">
                                      <span>Freelance {selectedProfile.title}</span>
                                      <span className="text-stone-500 font-normal">2018 - Present</span>
                                   </div>
                                   <p className="text-stone-700 mt-2 text-justify">
                                      Delivered high-quality projects for diverse clients in the {selectedProfile.category} sector. 
                                      Maintained a {selectedProfile.rating} star rating over {selectedProfile.experienceYears} years of experience.
                                   </p>
                                </div>
                             </section>

                             <section>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-3">Skills</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-stone-700">
                                   {selectedProfile.skills.map(s => <div key={s} className="flex items-center"><span className="w-1.5 h-1.5 bg-stone-300 rounded-full mr-2"></span>{s}</div>)}
                                </div>
                             </section>

                              <section>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-3">Education</h3>
                                <div className="flex justify-between items-baseline">
                                      <span className="font-bold text-stone-800">{selectedProfile.qualification} in Related Field</span>
                                      <span className="text-stone-500 text-sm">Graduated 2017</span>
                                </div>
                             </section>
                          </div>
                       </div>
                       
                       {/* Actions */}
                       <div className="mt-8 flex space-x-4">
                            <button 
                                className="bg-stone-800 text-white px-6 py-2 rounded-full shadow hover:bg-stone-700 transition"
                                onClick={() => {
                                 const link = document.createElement('a');
                                 link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('Simulated Resume Download');
                                 link.download = `${selectedProfile.name.replace(' ', '_')}_Resume.pdf`;
                                 link.click();
                             }}
                            >
                                <i className="fas fa-download mr-2"></i> Download PDF
                            </button>
                       </div>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    );
  };

  const renderAuth = () => (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-200">
        <div className="text-center mb-8">
          <i className="fas fa-bolt text-4xl text-stone-900 mb-4"></i>
          <h2 className="text-3xl font-bold text-stone-900">
            {authMode === 'login' ? 'Welcome Back' : 'Join the Hive'}
          </h2>
          <p className="text-stone-500 mt-2">
            {authMode === 'login' ? 'Login to manage your portfolio' : 'Create an account to get started'}
          </p>
        </div>

        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
            {authError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Full Name</label>
              <input
                type="text"
                required
                className={commonInputClass}
                value={authName}
                onChange={e => setAuthName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Email Address</label>
            <input
              type="email"
              required
              className={commonInputClass}
              value={authEmail}
              onChange={e => setAuthEmail(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 rounded-lg shadow-md transform transition hover:scale-[1.02]"
          >
            {authMode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-stone-500">
          {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                setAuthError(null);
            }}
            className="text-stone-900 hover:underline font-medium"
          >
            {authMode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPortfolio = () => {
    if (!user) {
        handleNavigate('auth');
        return null;
    }

    if (showPortfolioForm) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <PortfolioForm 
                userId={user.id} 
                userName={user.name} 
                initialData={editingProfile}
                onSubmit={handleSavePortfolio}
                onCancel={() => { setShowPortfolioForm(false); setEditingProfile(undefined); }}
            />
        </div>
      );
    }

    if (!userProfile) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="bg-white p-10 rounded-3xl border border-dashed border-stone-300 max-w-lg shadow-sm">
                    <i className="fas fa-folder-plus text-6xl text-stone-300 mb-6"></i>
                    <h2 className="text-2xl font-bold text-stone-900 mb-2">No Portfolio Yet</h2>
                    <p className="text-stone-500 mb-8">Showcase your best work to the world. Create your portfolio now.</p>
                    <button 
                        onClick={() => setShowPortfolioForm(true)}
                        className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all"
                    >
                        Create Portfolio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-stone-900">My Portfolio</h2>
                <div className="flex space-x-4">
                     <button 
                        onClick={() => { setEditingProfile(userProfile); setShowPortfolioForm(true); }}
                        className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-lg font-medium"
                    >
                        <i className="fas fa-edit mr-2"></i> Edit
                    </button>
                     <button 
                        onClick={() => handleDeletePortfolio(userProfile.id)}
                        className="bg-white hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium border border-red-200 transition-colors"
                    >
                        <i className="fas fa-trash mr-2"></i> Delete
                    </button>
                </div>
            </div>
            
            {/* Preview of the card as seen by others */}
            <div className="flex justify-center mb-10">
                 <div className="w-full max-w-sm">
                    <PortfolioCard profile={userProfile} onView={handleViewProfile} />
                 </div>
            </div>
             <p className="text-center text-stone-400 text-sm mb-10">This is how your card appears in the Explore feed.</p>

            <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
                <h3 className="text-xl font-bold text-stone-900 mb-4">Portfolio Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-stone-50 p-4 rounded-lg border border-stone-100">
                        <p className="text-stone-500 text-sm">Profile Views</p>
                        <p className="text-2xl font-bold text-stone-800">1,234</p>
                    </div>
                     <div className="bg-stone-50 p-4 rounded-lg border border-stone-100">
                        <p className="text-stone-500 text-sm">Rating</p>
                        <div className="flex items-center text-amber-500 text-2xl font-bold">
                             {userProfile.rating} <i className="fas fa-star text-lg ml-2"></i>
                        </div>
                    </div>
                     <div className="bg-stone-50 p-4 rounded-lg border border-stone-100">
                        <p className="text-stone-500 text-sm">Hourly Rate</p>
                        <p className="text-2xl font-bold text-green-600">NPR {userProfile.hourlyRate}</p>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const renderCareers = () => (
    <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Join Our Internal Team</h2>
            <p className="text-stone-500">
                Creative Lancer is always looking for talent to help build the platform.
                Submit your application below.
            </p>
        </div>

        {appSubmitted ? (
            <div className="bg-green-50 border border-green-200 p-8 rounded-xl text-center">
                <i className="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
                <h3 className="text-2xl font-bold text-stone-900 mb-2">Application Received!</h3>
                <p className="text-stone-500">We will review your details and get back to you shortly.</p>
                <button onClick={() => setAppSubmitted(false)} className="mt-6 text-stone-800 underline">Submit another</button>
            </div>
        ) : (
            <form onSubmit={handleSubmitApplication} className="bg-white p-8 rounded-xl border border-stone-200 shadow-lg space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Full Name</label>
                    <input
                        type="text"
                        required
                        className={commonInputClass}
                        onChange={e => setJobApp(p => ({...p, name: e.target.value}))}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Email</label>
                    <input
                        type="email"
                        required
                        className={commonInputClass}
                        onChange={e => setJobApp(p => ({...p, email: e.target.value}))}
                    />
                </div>
                
                {/* Position Selection */}
                <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">Applying For</label>
                    <div className="flex items-center space-x-6 mb-3">
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="radio" 
                                name="posType" 
                                checked={!useCustomPosition} 
                                onChange={() => {
                                    setUseCustomPosition(false);
                                    setJobApp(p => ({...p, position: 'Platform Developer (React)'}));
                                }}
                                className="mr-2 text-stone-800 focus:ring-stone-500 bg-stone-50 border-stone-300"
                            />
                            <span className="text-stone-600">Open Position</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="radio" 
                                name="posType" 
                                checked={useCustomPosition} 
                                onChange={() => {
                                    setUseCustomPosition(true);
                                    setJobApp(p => ({...p, position: ''}));
                                }}
                                className="mr-2 text-stone-800 focus:ring-stone-500 bg-stone-50 border-stone-300"
                            />
                            <span className="text-stone-600">Other Role</span>
                        </label>
                    </div>

                    {!useCustomPosition ? (
                        <div className="relative">
                            <select
                                className={`${commonInputClass} appearance-none cursor-pointer`}
                                onChange={e => setJobApp(p => ({...p, position: e.target.value}))}
                                value={jobApp.position || 'Platform Developer (React)'}
                            >
                                <option>Platform Developer (React)</option>
                                <option>Community Manager</option>
                                <option>Marketing Specialist</option>
                                <option>Content Moderator</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-400">
                                <i className="fas fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                    ) : (
                        <input
                            type="text"
                            placeholder="e.g. Senior Sound Engineer"
                            className={commonInputClass}
                            onChange={e => setJobApp(p => ({...p, position: e.target.value}))}
                            value={jobApp.position || ''}
                            autoFocus
                        />
                    )}
                </div>

                {/* File Upload for Cover Letter */}
                <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">
                        Cover Letter (PDF/Word, Max 2MB)
                    </label>
                    <div className="relative">
                         <input 
                             type="file"
                             accept=".pdf,.doc,.docx"
                             onChange={handleFileChange}
                             className="block w-full text-sm text-stone-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-stone-800 file:text-white
                                hover:file:bg-stone-700
                                bg-stone-50 border border-stone-200 rounded-lg cursor-pointer
                             "
                             required
                         />
                    </div>
                    {fileError && <p className="text-red-500 text-xs mt-2">{fileError}</p>}
                    {jobApp.coverLetter && !fileError && (
                         <p className="text-green-600 text-xs mt-2">
                             <i className="fas fa-check mr-1"></i> Attached: {jobApp.coverLetter}
                         </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!fileError}
                >
                    Submit Application
                </button>
            </form>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-800 font-sans selection:bg-stone-200 selection:text-stone-900">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />
      
      <main className="fade-in">
        {currentPage === 'home' && renderHome()}
        {currentPage === 'auth' && renderAuth()}
        {currentPage === 'portfolio' && renderPortfolio()}
        {currentPage === 'careers' && renderCareers()}
        {currentPage === 'profile-detail' && renderProfileDetail()}
      </main>
      
      <footer className="bg-[#FDFCF8] border-t border-stone-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-stone-400 text-sm">
          <p>&copy; 2024 Creative Lancer. All rights reserved.</p>
          <p className="mt-2">Made with React, Tailwind & <i className="fas fa-heart text-red-400"></i> in Nepal</p>
        </div>
      </footer>
    </div>
  );
};

export default App;