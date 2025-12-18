import { FreelancerProfile, User, JobApplication, Qualification, Category } from '../types';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// LocalStorage Keys
const USERS_KEY = 'cl_users';
const PROFILES_KEY = 'cl_profiles';
const APPLICATIONS_KEY = 'cl_applications';
const CURRENT_USER_KEY = 'cl_current_user';

// --- Auth Service ---

export const authService = {
  async signUp(email: string, name: string): Promise<{ user: User | null, error: string | null }> {
    await delay(500);
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find(u => u.email === email)) {
      return { user: null, error: 'User already exists' };
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return { user: newUser, error: null };
  },

  async signIn(email: string): Promise<{ user: User | null, error: string | null }> {
    await delay(500);
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.email === email);

    if (!user) {
      return { user: null, error: 'User not found' };
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { user, error: null };
  },

  async signOut(): Promise<void> {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser(): User | null {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }
};

// --- Portfolio/Profile Service ---

export const portfolioService = {
  async getProfiles(): Promise<FreelancerProfile[]> {
    await delay(300);
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
    return profiles;
  },

  async getMyProfile(userId: string): Promise<FreelancerProfile | undefined> {
    await delay(200);
    const profiles: FreelancerProfile[] = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
    return profiles.find(p => p.userId === userId);
  },

  async upsertProfile(profile: FreelancerProfile): Promise<FreelancerProfile> {
    await delay(600);
    let profiles: FreelancerProfile[] = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
    const index = profiles.findIndex(p => p.id === profile.id);

    // Auto Rating Logic
    const baseRating = 1; // Everyone starts with 1
    const qualBonus = {
        [Qualification.SELF_TAUGHT]: 0.5,
        [Qualification.CERTIFICATE]: 1,
        [Qualification.BACHELORS]: 2,
        [Qualification.MASTERS]: 3,
        [Qualification.PHD]: 4
    }[profile.qualification] || 0;
    
    const expBonus = Math.min(profile.experienceYears * 0.5, 2.5); // 0.5 stars per year, max 2.5
    
    let calculatedRating = baseRating + qualBonus + expBonus;
    if (calculatedRating > 5) calculatedRating = 5;
    
    const updatedProfile = { ...profile, rating: parseFloat(calculatedRating.toFixed(1)) };

    if (index >= 0) {
      profiles[index] = updatedProfile;
    } else {
      profiles.push(updatedProfile);
    }

    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    return updatedProfile;
  },

  async deleteProfile(id: string): Promise<void> {
    await delay(400);
    let profiles: FreelancerProfile[] = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
    profiles = profiles.filter(p => p.id !== id);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  },

  async submitApplication(application: JobApplication): Promise<void> {
    await delay(600);
    const apps = JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || '[]');
    apps.push(application);
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
  }
};

// Initial Seed Data
const seedData = () => {
    if (!localStorage.getItem(PROFILES_KEY)) {
        const dummyProfiles: FreelancerProfile[] = [
            {
                id: '1',
                userId: 'u1',
                name: 'Aarav Nepal',
                title: 'Senior Concept Artist',
                category: Category.ARTS,
                hourlyRate: 2500,
                experienceYears: 6,
                qualification: Qualification.BACHELORS,
                rating: 4.8,
                bio: 'Specializing in environmental concept art for games and films.',
                skills: ['Photoshop', 'Blender', 'Illustration'],
                imageUrl: 'https://picsum.photos/seed/artist1/400/400',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                userId: 'u2',
                name: 'Sina Gurung',
                title: 'Motion Designer',
                category: Category.MOTION_GRAPHICS,
                hourlyRate: 3000,
                experienceYears: 4,
                qualification: Qualification.CERTIFICATE,
                rating: 4.2,
                bio: 'Creating smooth animations and impactful visual effects.',
                skills: ['After Effects', 'Cinema 4D'],
                imageUrl: 'https://picsum.photos/seed/motion1/400/400',
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                userId: 'u3',
                name: 'Rohan Shrestha',
                title: 'UX Researcher',
                category: Category.DESIGNERS,
                hourlyRate: 2000,
                experienceYears: 3,
                qualification: Qualification.MASTERS,
                rating: 4.5,
                bio: 'Data-driven design approach with a focus on accessibility.',
                skills: ['Figma', 'User Testing'],
                imageUrl: 'https://picsum.photos/seed/design1/400/400',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(PROFILES_KEY, JSON.stringify(dummyProfiles));
    }
};

seedData();
