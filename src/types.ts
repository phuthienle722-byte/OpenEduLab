export type CountryCode = string;

export type CategoryId = 
  | 'math'              // Toán học
  | 'physics'           // Vật lý
  | 'chemistry'         // Hóa học
  | 'biology'           // Sinh học
  | 'informatics'       // Tin học & Công nghệ
  | 'literature'        // Ngữ văn
  | 'english'           // Tiếng Anh
  | 'history'           // Lịch sử
  | 'geography'         // Địa lý
  | 'natural_sciences'  // Khoa học tự nhiên (KHTN)
  | 'khtn'              // KHTN alias
  | 'stem'              // STEM & Thí nghiệm ảo
  | 'general'          // Môn học khác
  | 'toan';             // Hỗ trợ tương thích ngược cho dữ liệu cũ

export type EducationLevelId =
  | 'all'
  | 'primary'      // Tiểu học (Lớp 1 - 5)
  | 'secondary'    // THCS (Lớp 6 - 9)
  | 'highschool'   // THPT (Lớp 10 - 12)
  | 'university'   // Đại học & Sau đại học
  | 'vocational'   // Nghề & Kỹ năng
  | 'general';     // Mọi cấp học

export interface WebProject {
  id: string;
  title: string;
  url: string;
  description: string;
  country: CountryCode;
  category: CategoryId;
  educationLevel: EducationLevelId;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string khi admin chỉnh sửa
  previewImage?: string;
  authorName: string;
  authorContact?: string;
  tags: string[];
  views: number;
  likes: number;
  downloads?: number; // Số lượt tải về tài liệu / giáo án / QR
  contributions?: number; // Số lượt đóng góp tài nguyên / bài tập
  commentCount?: number; // Số lượng bình luận
  goLink?: string; // Link /go/<mã-hóa> dùng cho người dùng thường (ẩn URL gốc)
  isFamous?: boolean; // Website mô phỏng nổi tiếng (PhET, GeoGebra, NetSim...)
  isUserSubmission?: boolean; // Bài do NGƯỜI DÙNG đăng lên, admin đã duyệt → thuộc tab "Bài đăng tải"
}

export type CommentRole = 'teacher' | 'student' | 'creator' | 'guest';
export type CommentCategory = 'experience' | 'feedback' | 'question';

export interface ProjectComment {
  id: string;
  projectId: string;
  authorName: string;
  authorRole: CommentRole;
  category: CommentCategory;
  content: string;
  rating?: number; // 1 - 5 sao
  createdAt: string; // ISO string
  likes: number;
}

export interface ProjectStatsDirty {
  projectId: string;
  views: number;
  likes: number;
  downloads: number;
  contributions: number;
  commentCount: number;
}

export const LANGUAGE_CODES = [
  'vi',
  'en',
  'th',
  'my',
  'lo',
  'km',
  'id',
  'ms',
  'tl',
  'tet',
] as const;

/**
 * Ngôn ngữ được hỗ trợ: Tiếng Anh + ngôn ngữ của 11 nước Đông Nam Á
 * (Việt Nam, Singapore – English, Thái Lan, Myanmar, Lào, Campuchia,
 *  Indonesia, Malaysia, Brunei – Melayu, Philippines, Đông Timor – Tetun)
 */
export type Language = (typeof LANGUAGE_CODES)[number];

export type ViewMode = 'compact' | 'expanded';

export interface SubjectOption {
  id: CategoryId;
  name: string;
}

export const VN_SUBJECTS: SubjectOption[] = [
  { id: 'math', name: 'Toán học 📐' },
  { id: 'physics', name: 'Vật lí ⚡' },
  { id: 'chemistry', name: 'Hóa học 🧪' },
  { id: 'biology', name: 'Sinh học 🧬' },
  { id: 'informatics', name: 'Tin học 💻' },
  { id: 'literature', name: 'Ngữ văn 📖' },
  { id: 'english', name: 'Tiếng Anh 🇬🇧' },
  { id: 'history', name: 'Lịch sử 🏛️' },
  { id: 'geography', name: 'Địa lí 🌍' },
  { id: 'natural_sciences', name: 'Khoa học tự nhiên (KHTN) 🔬' },
  { id: 'stem', name: 'STEM & Thí nghiệm ảo 🚀' },
  { id: 'general', name: 'Môn học khác 🎨' },
];

export interface LocalizedProjectContent {
  id: string;
  title: string;
  description: string;
  authorName: string;
  tags: string[];
}

export interface FilterState {
  searchQuery: string;
  category: CategoryId | 'ALL';
  educationLevel: EducationLevelId | 'ALL';
  sortBy: 'newest' | 'oldest' | 'most_liked' | 'most_viewed';
  onlyFamous: boolean;
}

