export enum Category {
  ARTS = 'Arts',
  DESIGNERS = 'Designers',
  MOTION_GRAPHICS = 'Motion Graphics',
  SOUND = 'Sound'
}

export enum Qualification {
  SELF_TAUGHT = 'Self Taught',
  CERTIFICATE = 'Certificate',
  BACHELORS = 'Bachelors',
  MASTERS = 'Masters',
  PHD = 'PhD'
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface FreelancerProfile {
  id: string;
  userId: string; // Links to User
  name: string;
  title: string;
  category: Category;
  hourlyRate: number; // In NPR
  experienceYears: number;
  qualification: Qualification;
  rating: number; // Auto-calculated 0-5
  bio: string;
  skills: string[];
  resumeUrl?: string;
  portfolioUrl?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  name: string;
  email: string;
  position: string;
  coverLetter: string;
  portfolioLink: string;
}
