export type ConsultationTopic =
  | 'Pemasaran Digital'
  | 'Foto & Kemasan Produk'
  | 'Pembukuan & Arus Kas'
  | 'Etalase Online'
  | 'Belajar & Modul'
  | 'Lainnya';

export type ConsultationFormat = 'chat' | 'video' | 'tatap_muka';

export type ConsultationStatus =
  | 'menunggu'
  | 'dijadwalkan'
  | 'selesai'
  | 'perlu_jadwal_baru'
  | 'dibatalkan';

export interface MentorProfile {
  id: string;
  name: string;
  title: string;
  institution: string;
  avatar: string;
  rating: number;
  consultation_count: number;
  expertise: string[];
  is_available: boolean;
  response_time: string;
  bio: string;
}

export interface ConsultationBooking {
  id: string;
  mentor_id: string;
  mentor_name: string;
  mentor_title: string;
  mentor_avatar: string;
  topic: ConsultationTopic;
  description: string;
  preferred_dates: string[];
  confirmed_date?: string | null;
  format: ConsultationFormat;
  status: ConsultationStatus;
  meet_link?: string | null;
  attachment_name?: string | null;
  rating?: number | null;
  review?: string | null;
  created_at: string;
}

export interface MentorTask {
  id: string;
  consultation_id?: string;
  title: string;
  description: string;
  category: string;
  is_completed: boolean;
  created_at: string;
  due_date?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'umkm' | 'mentor';
  text: string;
  image_url?: string | null;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export type ForumCategory =
  | 'Semua'
  | 'Pemasaran'
  | 'Keuangan'
  | 'Produk & Kemasan'
  | 'Tips Usaha'
  | 'Tanya Jawab';

export interface ForumReply {
  id: string;
  post_id: string;
  author_name: string;
  author_store: string;
  is_mentor: boolean;
  text: string;
  likes_count: number;
  is_liked_by_me?: boolean;
  is_best_answer: boolean;
  created_at: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_store: string;
  is_author_me: boolean;
  category: string;
  replies_count: number;
  likes_count: number;
  is_liked_by_me?: boolean;
  is_solved: boolean;
  created_at: string;
  replies: ForumReply[];
}

export interface DataSharingPermissions {
  share_profile: boolean;
  share_products: boolean;
  share_finance: boolean; // DEFAULT FALSE!
  share_learning: boolean;
  last_updated?: string;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  action_label?: string;
  action_url?: string;
}

export interface ConsultationPageData {
  mentor: MentorProfile;
  other_mentors: MentorProfile[];
  bookings: ConsultationBooking[];
  mentor_tasks: MentorTask[];
  chat_messages: ChatMessage[];
  forum_posts: ForumPost[];
  permissions: DataSharingPermissions;
  faqs: FaqItem[];
  quick_suggestions: string[];
}
