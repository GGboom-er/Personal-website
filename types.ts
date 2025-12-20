export interface Project {
  id: string;
  title: string;
  category: string;
  role: string;
  description: string;
  icon: string; // URL for the app icon
  heroImage: string; // URL for the big background
  tags: string[];
  stats: {
    label: string;
    value: string;
  }[];
  section: 'Profile' | 'Projects' | 'Skills';
}

export type Category = 'All' | 'Productivity' | 'Games' | 'Design' | 'AI';