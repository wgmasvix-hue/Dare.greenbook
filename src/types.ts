export type Subject = 
  | "Mathematics" 
  | "Grade 7 Mathematics"
  | "English Language" 
  | "Biology" 
  | "Chemistry" 
  | "Physics" 
  | "History" 
  | "Heritage-Based Curriculum"
  | "Indigenous Languages"
  | "Additional Mathematics"
  | "Agriculture"
  | "Arts"
  | "Commerce"
  | "Commercial Studies"
  | "Computer Science"
  | "Home Management and Design"
  | "Literature in English"
  | "Literature in Indigenous Languages"
  | "Business Enterprise and Skills"
  | "Dance"
  | "Design and Technology"
  | "Economic History"
  | "Economics"
  | "Food Technology & Design"
  | "Foreign Languages"
  | "Accounting"
  | "Geography"
  | "Guidance and Counselling"
  | "Metal Technology"
  | "Building Technology"
  | "Musical Arts"
  | "Statistics"
  | "Physical Education"
  | "Pure Mathematics"
  | "Technical Graphics"
  | "Textile and Design Technology"
  | "Theatre"
  | "Wood Technology & Design"
  | "Life Skills Orientation Programme"
  | "Sociology"
  | "Combined Science"
  | "Visual and Performing Arts"
  | "Mass Displays"
  | "Mathematics and Science"
  | "Family and Heritage Studies"
  | "Information and Communication Technology"
  | "Shona"
  | "Ndebele"
  | "Xangani"
  | "Tshvenda"
  | "Sotho"
  | "Kalanga"
  | "Tswana"
  | "Xhosa"
  | "Barwe"
  | "Chewa"
  | "Nambya"
  | "Tonga"
  | "Ndau"
  | "Khoisan"
  | "Science and Technology"
  | "Family, Religion and Moral Education"
  | "Heritage – Social Studies"
  | "Heritage Studies"
  | "Film"
  | "Crop Science"
  | "Agricultural Engineering"
  | "Sport Management"
  | "Family and Religious Education"
  | "Sports Science and Technology"
  | "Software Engineering"
  | "Animal Science"
  | "Communication Skills"
  | "Music"
  | "Business Studies"
  | "Mechanical Mathematics"
  | "Horticulture"
  | "Business Enterprise";

export type Level = "Infant" | "Junior" | "Grade 7" | "O-Level" | "A-Level";

export type Grade = 
  | "ECD A" | "ECD B" | "Grade 1" | "Grade 2"
  | "Grade 3" | "Grade 4" | "Grade 5" | "Grade 6" | "Grade 7"
  | "Form 1" | "Form 2" | "Form 3" | "Form 4"
  | "Form 5" | "Form 6";

export type ContentType = 
  | "Practice Paper" 
  | "Exam Paper"
  | "Quiz" 
  | "Flashcards" 
  | "Explanations" 
  | "Textbook Chapter"
  | "Feedback"
  | "Syllabus Guide";

export interface GenerationRequest {
  subject: Subject;
  level: Level;
  grade: Grade;
  contentType: ContentType;
  topic?: string;
  studentInput?: string; // For feedback or specific questions
  image?: string; // Base64 encoded image
  referenceContent?: string; // Text extracted from a reference textbook or document
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface SavedMaterial {
  id: string;
  user_id?: string;
  subject: Subject;
  level: Level;
  grade: Grade;
  contentType: ContentType;
  topic: string;
  content: any;
  generatedImage: string | null;
  audioUrl?: string | null;
  timestamp: number;
}
