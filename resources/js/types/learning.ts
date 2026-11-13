export type ModuleCategory =
  | 'Dasar Digital'
  | 'Foto dan Konten'
  | 'Media Sosial'
  | 'Branding dan Kemasan'
  | 'Pembukuan'
  | 'Menjual Online';

export type DifficultyLevel = 'Pemula' | 'Menengah';

export interface StepItem {
  id: number;
  step_number: number;
  title: string;
  content: string; // Concise practical text with bullet points
  image_url?: string;
  video_embed_url?: string;
  practical_task: string; // "Praktik kecil" 1-2 minute task for their business
}

export interface QuizOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface QuizQuestion {
  id: string;
  indicator: string; // e.g. "Memahami pentingnya pencahayaan alami foto produk"
  question: string;
  options: QuizOption[];
  explanation?: string; // Only sent after submission
  correct_option?: string; // Only sent after submission
}

export interface ModuleItem {
  id: string;
  title: string;
  slug: string;
  category: ModuleCategory;
  description: string;
  duration_minutes: number;
  level: DifficultyLevel;
  objectives: string[]; // 3 points: "Setelah ini kamu bisa..."
  prerequisite_id?: string | null;
  prerequisite_title?: string | null;
  badge_id: string;
  badge_title: string;
  badge_icon: string;
  steps: StepItem[];
  pre_test_questions: QuizQuestion[];
  post_test_questions: QuizQuestion[];
}

export interface UserModuleProgress {
  module_id: string;
  status: 'belum_dimulai' | 'sedang_belajar' | 'selesai';
  current_step: number;
  total_steps: number;
  pre_test_score: number | null; // null if skipped
  post_test_score: number | null;
  best_post_test_score: number | null;
  attempts_count: number;
  passed: boolean;
  last_accessed_at: string;
  completed_at?: string | null;
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  requirement: string;
  is_unlocked: boolean;
  unlocked_at?: string | null;
  progress_percent: number;
}

export interface LearningActivity {
  id: string;
  title: string;
  type: 'module_completed' | 'test_taken' | 'badge_earned' | 'started';
  description: string;
  date: string;
  score?: number;
}

export interface LearningRecommendation {
  module_id: string;
  module_title: string;
  reason: string;
  category: ModuleCategory;
}

export interface LearningOverallStats {
  modules_completed: number;
  total_modules: number;
  total_learning_hours: number;
  badges_earned: number;
  total_badges: number;
  avg_post_test_score: number;
  avg_score_increase: number;
  streak_learning_days: number;
}
