import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  BrainCircuit, 
  GraduationCap, 
  History, 
  Calculator, 
  FlaskConical, 
  Languages, 
  FileText,
  ScrollText,
  CheckSquare,
  Lightbulb,
  Compass,
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  Bell,
  BellOff,
  Cloud,
  CloudOff,
  CloudUpload,
  CloudDownload,
  ShieldAlert,
  Clock,
  Calendar,
  XCircle,
  Search,
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Camera,
  Upload,
  X,
  RefreshCw,
  StickyNote,
  Save,
  Download,
  Trash2,
  Palette,
  Monitor,
  Briefcase,
  Globe,
  Users,
  Scissors,
  Hammer,
  Dumbbell,
  PieChart,
  Theater,
  Trees,
  Music,
  Stethoscope,
  Landmark,
  TrendingUp,
  Utensils,
  Book,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  PenTool,
  HeartPulse,
  Music2,
  Film,
  Sprout,
  Cpu,
  Microscope,
  Globe2,
  Layout,
  Layers,
  Component,
  Settings,
  Shield,
  Zap,
  Activity,
  UserCheck,
  MessageSquare,
  Volume2,
  Map,
  Church,
  Scale,
  Gavel,
  Coins,
  LineChart,
  HardHat,
  Construction,
  Database,
  Wrench,
  Truck,
  Factory,
  Box,
  Package,
  Package as PackageIcon,
  ShoppingCart,
  CreditCard,
  PieChart as PieChartIcon,
  Quote,
  User,
  LogIn,
  LogOut,
  Mail,
  Lock,
  UserPlus,
  HelpCircle,
  ExternalLink,
  Star,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { Input } from './components/ui/Input';
import { generateExamContent, suggestTopics, generateImage, generateAudioExplanation, testConnection } from './services/ai';
import { Subject, Level, Grade, ContentType, Flashcard, QuizQuestion, SavedMaterial, Draft, Difficulty } from './types';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const GRADES_BY_LEVEL: Record<Level, Grade[]> = {
  "Infant": ["ECD A", "ECD B", "Grade 1", "Grade 2"],
  "Junior": ["Grade 3", "Grade 4", "Grade 5", "Grade 6"],
  "Grade 7": ["Grade 7"],
  "O-Level": ["Form 1", "Form 2", "Form 3", "Form 4"],
  "A-Level": ["Form 5", "Form 6"]
};

const SUBJECTS: { id: Subject; icon: React.ReactNode; color: string; span?: string }[] = [
  { id: "Mathematics", icon: <Calculator className="w-6 h-6" />, color: "bg-blue-500", span: "col-span-2 row-span-2" },
  { id: "English Language", icon: <Languages className="w-6 h-6" />, color: "bg-orange-500", span: "col-span-2" },
  { id: "Biology", icon: <FlaskConical className="w-6 h-6" />, color: "bg-green-500" },
  { id: "Chemistry", icon: <FlaskConical className="w-6 h-6" />, color: "bg-purple-500" },
  { id: "Physics", icon: <FlaskConical className="w-6 h-6" />, color: "bg-cyan-500" },
  { id: "History", icon: <History className="w-6 h-6" />, color: "bg-amber-600", span: "col-span-2" },
  { id: "Heritage-Based Curriculum", icon: <GraduationCap className="w-6 h-6" />, color: "bg-emerald-600", span: "col-span-2 row-span-2" },
  { id: "Computer Science", icon: <Monitor className="w-6 h-6" />, color: "bg-indigo-600", span: "col-span-2" },
  { id: "Geography", icon: <Globe className="w-6 h-6" />, color: "bg-sky-600" },
  { id: "Economics", icon: <TrendingUp className="w-6 h-6" />, color: "bg-emerald-500" },
  { id: "Accounting", icon: <PieChartIcon className="w-6 h-6" />, color: "bg-blue-600" },
  { id: "Combined Science", icon: <Stethoscope className="w-6 h-6" />, color: "bg-emerald-400", span: "col-span-2" },
  { id: "Agriculture", icon: <Trees className="w-6 h-6" />, color: "bg-green-700" },
  { id: "Business Studies", icon: <Briefcase className="w-6 h-6" />, color: "bg-slate-700" },
  { id: "Indigenous Languages", icon: <Languages className="w-6 h-6" />, color: "bg-rose-500" },
  { id: "Shona", icon: <Languages className="w-6 h-6" />, color: "bg-rose-500" },
  { id: "Ndebele", icon: <Languages className="w-6 h-6" />, color: "bg-rose-600" },
  { id: "Grade 7 Mathematics", icon: <Calculator className="w-6 h-6" />, color: "bg-indigo-500" },
  { id: "Additional Mathematics", icon: <Calculator className="w-6 h-6" />, color: "bg-blue-700" },
  { id: "Arts", icon: <Palette className="w-6 h-6" />, color: "bg-pink-500" },
  { id: "Commerce", icon: <Briefcase className="w-6 h-6" />, color: "bg-slate-700" },
  { id: "Commercial Studies", icon: <Briefcase className="w-6 h-6" />, color: "bg-slate-600" },
  { id: "Home Management and Design", icon: <Utensils className="w-6 h-6" />, color: "bg-orange-400" },
  { id: "Literature in English", icon: <Book className="w-6 h-6" />, color: "bg-blue-400" },
  { id: "Literature in Indigenous Languages", icon: <Book className="w-6 h-6" />, color: "bg-rose-400" },
  { id: "Business Enterprise and Skills", icon: <TrendingUp className="w-6 h-6" />, color: "bg-emerald-700" },
  { id: "Dance", icon: <Music2 className="w-6 h-6" />, color: "bg-purple-400" },
  { id: "Design and Technology", icon: <PenTool className="w-6 h-6" />, color: "bg-slate-500" },
  { id: "Economic History", icon: <Landmark className="w-6 h-6" />, color: "bg-amber-700" },
  { id: "Food Technology & Design", icon: <Utensils className="w-6 h-6" />, color: "bg-orange-600" },
  { id: "Foreign Languages", icon: <Languages className="w-6 h-6" />, color: "bg-violet-500" },
  { id: "Guidance and Counselling", icon: <Users className="w-6 h-6" />, color: "bg-teal-500" },
  { id: "Metal Technology", icon: <Hammer className="w-6 h-6" />, color: "bg-zinc-600" },
  { id: "Building Technology", icon: <Hammer className="w-6 h-6" />, color: "bg-stone-600" },
  { id: "Musical Arts", icon: <Music className="w-6 h-6" />, color: "bg-fuchsia-500" },
  { id: "Statistics", icon: <PieChartIcon className="w-6 h-6" />, color: "bg-indigo-400" },
  { id: "Physical Education", icon: <Dumbbell className="w-6 h-6" />, color: "bg-red-600" },
  { id: "Pure Mathematics", icon: <Calculator className="w-6 h-6" />, color: "bg-blue-800" },
  { id: "Technical Graphics", icon: <PenTool className="w-6 h-6" />, color: "bg-slate-400" },
  { id: "Textile and Design Technology", icon: <Scissors className="w-6 h-6" />, color: "bg-pink-600" },
  { id: "Theatre", icon: <Theater className="w-6 h-6" />, color: "bg-red-700" },
  { id: "Wood Technology & Design", icon: <Hammer className="w-6 h-6" />, color: "bg-amber-800" },
  { id: "Life Skills Orientation Programme", icon: <HeartPulse className="w-6 h-6" />, color: "bg-rose-600" },
  { id: "Sociology", icon: <Users className="w-6 h-6" />, color: "bg-indigo-500" },
  { id: "Visual and Performing Arts", icon: <Palette className="w-6 h-6" />, color: "bg-pink-400" },
  { id: "Mass Displays", icon: <Layout className="w-6 h-6" />, color: "bg-blue-400" },
  { id: "Mathematics and Science", icon: <Calculator className="w-6 h-6" />, color: "bg-indigo-400" },
  { id: "Family and Heritage Studies", icon: <Users className="w-6 h-6" />, color: "bg-amber-500" },
  { id: "Information and Communication Technology", icon: <Monitor className="w-6 h-6" />, color: "bg-cyan-600" },
  { id: "Xangani", icon: <Languages className="w-6 h-6" />, color: "bg-rose-700" },
  { id: "Tshvenda", icon: <Languages className="w-6 h-6" />, color: "bg-rose-800" },
  { id: "Sotho", icon: <Languages className="w-6 h-6" />, color: "bg-rose-900" },
  { id: "Kalanga", icon: <Languages className="w-6 h-6" />, color: "bg-pink-500" },
  { id: "Tswana", icon: <Languages className="w-6 h-6" />, color: "bg-pink-600" },
  { id: "Xhosa", icon: <Languages className="w-6 h-6" />, color: "bg-pink-700" },
  { id: "Barwe", icon: <Languages className="w-6 h-6" />, color: "bg-pink-800" },
  { id: "Chewa", icon: <Languages className="w-6 h-6" />, color: "bg-pink-900" },
  { id: "Nambya", icon: <Languages className="w-6 h-6" />, color: "bg-violet-500" },
  { id: "Tonga", icon: <Languages className="w-6 h-6" />, color: "bg-violet-600" },
  { id: "Ndau", icon: <Languages className="w-6 h-6" />, color: "bg-violet-700" },
  { id: "Khoisan", icon: <Languages className="w-6 h-6" />, color: "bg-violet-800" },
  { id: "Science and Technology", icon: <FlaskConical className="w-6 h-6" />, color: "bg-emerald-500" },
  { id: "Family, Religion and Moral Education", icon: <Church className="w-6 h-6" />, color: "bg-amber-600" },
  { id: "Heritage – Social Studies", icon: <Globe className="w-6 h-6" />, color: "bg-sky-500" },
  { id: "Heritage Studies", icon: <GraduationCap className="w-6 h-6" />, color: "bg-emerald-700" },
  { id: "Film", icon: <Film className="w-6 h-6" />, color: "bg-slate-800" },
  { id: "Crop Science", icon: <Sprout className="w-6 h-6" />, color: "bg-green-600" },
  { id: "Agricultural Engineering", icon: <Settings className="w-6 h-6" />, color: "bg-green-800" },
  { id: "Sport Management", icon: <Activity className="w-6 h-6" />, color: "bg-red-500" },
  { id: "Family and Religious Education", icon: <Church className="w-6 h-6" />, color: "bg-amber-700" },
  { id: "Sports Science and Technology", icon: <Activity className="w-6 h-6" />, color: "bg-red-700" },
  { id: "Software Engineering", icon: <Cpu className="w-6 h-6" />, color: "bg-indigo-700" },
  { id: "Animal Science", icon: <FlaskConical className="w-6 h-6" />, color: "bg-emerald-600" },
  { id: "Communication Skills", icon: <MessageSquare className="w-6 h-6" />, color: "bg-blue-600" },
  { id: "Music", icon: <Music className="w-6 h-6" />, color: "bg-fuchsia-600" },
  { id: "Mechanical Mathematics", icon: <Calculator className="w-6 h-6" />, color: "bg-blue-900" },
  { id: "Horticulture", icon: <Sprout className="w-6 h-6" />, color: "bg-green-500" },
  { id: "Business Enterprise", icon: <TrendingUp className="w-6 h-6" />, color: "bg-emerald-600" },
];

const CONTENT_TYPES: { id: ContentType; label: string; description: string; icon: React.ReactNode; color: string; premium?: boolean }[] = [
  { 
    id: "Practice Paper", 
    label: "Practice Paper", 
    description: "Full exam-style question sets",
    icon: <FileText className="w-6 h-6" />,
    color: "bg-blue-500"
  },
  { 
    id: "Exam Paper", 
    label: "Exam Paper", 
    description: "Full-length exam paper with MCQs, short answers, and essays", 
    icon: <ScrollText className="w-6 h-6" />,
    color: "bg-indigo-600",
    premium: true 
  },
  { 
    id: "Quiz", 
    label: "Interactive Quiz", 
    description: "Quick 5-10 multiple choice questions",
    icon: <CheckSquare className="w-6 h-6" />,
    color: "bg-emerald-500"
  },
  { 
    id: "Flashcards", 
    label: "Flashcards", 
    description: "Bite-sized revision cards",
    icon: <Layers className="w-6 h-6" />,
    color: "bg-amber-500"
  },
  { 
    id: "Explanations", 
    label: "Explanations", 
    description: "Step-by-step topic breakdowns", 
    icon: <Lightbulb className="w-6 h-6" />,
    color: "bg-purple-500",
    premium: true 
  },
  { 
    id: "Textbook Chapter", 
    label: "Textbook Chapter", 
    description: "Comprehensive Zimbabwean textbook-style content with heritage links", 
    icon: <BookOpen className="w-6 h-6" />,
    color: "bg-rose-500",
    premium: true 
  },
  { 
    id: "Syllabus Guide", 
    label: "Syllabus Guide", 
    description: "ZIMSEC syllabus overview & key topics",
    icon: <Compass className="w-6 h-6" />,
    color: "bg-cyan-500"
  },
  { 
    id: "Feedback", 
    label: "Essay Feedback", 
    description: "Get notes on your written work",
    icon: <MessageSquare className="w-6 h-6" />,
    color: "bg-orange-500"
  },
];

const DALE_CARNEGIE_QUOTES = [
  { text: "Most of the important things in the world have been accomplished by people who have kept on trying when there seemed to be no hope at all.", author: "Dale Carnegie" },
  { text: "Develop success from failures. Discouragement and failure are two of the surest stepping stones to success.", author: "Dale Carnegie" },
  { text: "Action cures fear, while inaction creates terror.", author: "Dale Carnegie" },
  { text: "The rare individual who unselfishly tries to serve others has an enormous advantage.", author: "Dale Carnegie" },
  { text: "Flaming enthusiasm, backed by horse sense and persistence, is the quality that most frequently makes for success.", author: "Dale Carnegie" },
  { text: "Success is getting what you want. Happiness is wanting what you get.", author: "Dale Carnegie" },
  { text: "First ask yourself: What is the worst that can happen? Then prepare to accept it. Then proceed to improve on the worst.", author: "Dale Carnegie" },
  { text: "Our fatigue is often caused not by work, but by worry, frustration and resentment.", author: "Dale Carnegie" },
  { text: "Knowledge isn't power until it is applied.", author: "Dale Carnegie" },
  { text: "Don't be afraid of enemies who attack you. Be afraid of the friends who flatter you.", author: "Dale Carnegie" },
  { text: "The only way to get the best of an argument is to avoid it.", author: "Dale Carnegie" },
  { text: "Show respect for the other person's opinions. Never say, 'You're wrong.'", author: "Dale Carnegie" },
  { text: "If you are wrong, admit it quickly and emphatically.", author: "Dale Carnegie" },
  { text: "Begin in a friendly way.", author: "Dale Carnegie" },
  { text: "Get the other person saying 'yes, yes' immediately.", author: "Dale Carnegie" },
  { text: "Let the other person do a great deal of the talking.", author: "Dale Carnegie" },
  { text: "Let the other person feel that the idea is his or hers.", author: "Dale Carnegie" },
  { text: "Try honestly to see things from the other person's point of view.", author: "Dale Carnegie" },
  { text: "Be sympathetic with the other person's ideas and desires.", author: "Dale Carnegie" },
  { text: "Appeal to the nobler motives.", author: "Dale Carnegie" },
  { text: "Dramatize your ideas.", author: "Dale Carnegie" },
  { text: "Throw down a challenge.", author: "Dale Carnegie" },
  { text: "If you want to gather honey, don't kick over the beehive.", author: "Dale Carnegie" },
  { text: "The secret of being miserable is to have leisure to bother about whether you are happy or not.", author: "Dale Carnegie" },
  { text: "Remember that a person's name is to that person the sweetest and most important sound in any language.", author: "Dale Carnegie" },
  { text: "Be a good listener. Encourage others to talk about themselves.", author: "Dale Carnegie" },
  { text: "Talk in terms of the other person's interests.", author: "Dale Carnegie" },
  { text: "Make the other person feel important – and do it sincerely.", author: "Dale Carnegie" },
  { text: "Smile.", author: "Dale Carnegie" },
  { text: "A man without a smiling face must not open a shop.", author: "Dale Carnegie" },
  { text: "Today is our most precious possession. It is the only property we are surely guaranteed.", author: "Dale Carnegie" },
  { text: "Are you bored with life? Then throw yourself into some work you believe in with all your heart, live for it, die for it, and you will find happiness that you had never dreamed could be yours.", author: "Dale Carnegie" },
  { text: "If you want to conquer fear, don't sit home and think about it. Go out and get busy.", author: "Dale Carnegie" },
  { text: "Inaction breeds doubt and fear. Action breeds confidence and courage.", author: "Dale Carnegie" },
  { text: "One of the most tragic things I know about human nature is that all of us tend to put off living. We are all dreaming of some magical rose garden over the horizon instead of enjoying the roses that are blooming outside our windows today.", author: "Dale Carnegie" },
  { text: "The successful man will profit from his mistakes and try again in a different way.", author: "Dale Carnegie" },
  { text: "You can make more friends in two months by becoming interested in other people than you can in two years by trying to get other people interested in you.", author: "Dale Carnegie" },
  { text: "Fear doesn't exist anywhere except in the mind.", author: "Dale Carnegie" },
  { text: "When we hate our enemies, we are giving them power over us: power over our sleep, our appetites, our blood pressure, our health, and our happiness.", author: "Dale Carnegie" },
  { text: "Happiness doesn't depend on any external conditions, it is governed by our mental attitude.", author: "Dale Carnegie" },
  { text: "If you can't sleep, then get up and do something instead of lying there worrying. It's the worry that gets you, not the lack of sleep.", author: "Dale Carnegie" },
  { text: "Instead of worrying about what people say of you, why not spend time trying to accomplish something they will admire.", author: "Dale Carnegie" },
  { text: "Our thoughts make us what we are.", author: "Dale Carnegie" },
  { text: "People rarely succeed unless they have fun in what they are doing.", author: "Dale Carnegie" },
  { text: "Tell me what gives a person his greatest feeling of importance, and I will tell you his entire philosophy of life.", author: "Dale Carnegie" },
  { text: "The person who goes farthest is generally the one who is willing to do and dare. The 'sure-thing' boat never gets far from shore.", author: "Dale Carnegie" },
  { text: "There is only one way... to get anybody to do anything. And that is by making the other person want to do it.", author: "Dale Carnegie" },
  { text: "Winning friends is the first step toward success.", author: "Dale Carnegie" },
  { text: "You can't win an argument. You can't because if you lose it, you lose it; and if you win it, you lose it.", author: "Dale Carnegie" },
  { text: "Your purpose is to make your audience see what you saw, hear what you heard, feel what you felt. Relevant detail, couched in concrete, colorful language, is the best way to recreate the incident as it happened and to picture it for others.", author: "Dale Carnegie" }
];

const ROBERT_GREENE_QUOTES = [
  { text: "Never outshine the master.", author: "Robert Greene" },
  { text: "Conceal your intentions.", author: "Robert Greene" },
  { text: "Always say less than necessary.", author: "Robert Greene" },
  { text: "Guard your reputation with your life.", author: "Robert Greene" },
  { text: "Court attention at all cost.", author: "Robert Greene" },
  { text: "Get others to do the work for you, but always take the credit.", author: "Robert Greene" },
  { text: "Make other people come to you – use bait if necessary.", author: "Robert Greene" },
  { text: "Win through your actions, never through argument.", author: "Robert Greene" },
  { text: "Infection: Avoid the unhappy and unlucky.", author: "Robert Greene" },
  { text: "Learn to keep people dependent on you.", author: "Robert Greene" },
  { text: "Use selective honesty and generosity to disarm your victim.", author: "Robert Greene" },
  { text: "When asking for help, appeal to people’s self-interest, never to their mercy or gratitude.", author: "Robert Greene" },
  { text: "Pose as a friend, work as a spy.", author: "Robert Greene" },
  { text: "Crush your enemy totally.", author: "Robert Greene" },
  { text: "Use absence to increase respect and honor.", author: "Robert Greene" },
  { text: "Keep others in suspended terror: cultivate an air of unpredictability.", author: "Robert Greene" },
  { text: "Do not build fortresses to protect yourself – isolation is dangerous.", author: "Robert Greene" },
  { text: "Know who you’re dealing with – do not offend the wrong person.", author: "Robert Greene" },
  { text: "Do not commit to anyone.", author: "Robert Greene" },
  { text: "Play a sucker to catch a sucker – seem dumber than your mark.", author: "Robert Greene" },
  { text: "Surrender tactic: Transform weakness into power.", author: "Robert Greene" },
  { text: "Concentrate your forces.", author: "Robert Greene" },
  { text: "Play the perfect courtier.", author: "Robert Greene" },
  { text: "Re-create yourself.", author: "Robert Greene" },
  { text: "Keep your hands clean.", author: "Robert Greene" },
  { text: "Play on people’s need to believe to create a cult-like following.", author: "Robert Greene" },
  { text: "Enter action with boldness.", author: "Robert Greene" },
  { text: "Plan all the way to the end.", author: "Robert Greene" },
  { text: "Make your accomplishments seem effortless.", author: "Robert Greene" },
  { text: "Control the options: Get others to play with the cards you deal.", author: "Robert Greene" },
  { text: "Play to people’s fantasies.", author: "Robert Greene" },
  { text: "Discover each man’s thumbscrew.", author: "Robert Greene" },
  { text: "Be royal in your own fashion: Act like a king to be treated like one.", author: "Robert Greene" },
  { text: "Master the art of timing.", author: "Robert Greene" },
  { text: "Disdain things you cannot have: Ignoring them is the best revenge.", author: "Robert Greene" },
  { text: "Create compelling spectacles.", author: "Robert Greene" },
  { text: "Think as you like but behave like others.", author: "Robert Greene" },
  { text: "Stir up waters to catch fish.", author: "Robert Greene" },
  { text: "Despise the free lunch.", author: "Robert Greene" },
  { text: "Avoid stepping into a great man’s shoes.", author: "Robert Greene" },
  { text: "Strike the shepherd and the sheep will scatter.", author: "Robert Greene" },
  { text: "Work on the hearts and minds of others.", author: "Robert Greene" },
  { text: "Disarm and infuriate with the mirror effect.", author: "Robert Greene" },
  { text: "Preach the need for change, but never reform too much at once.", author: "Robert Greene" },
  { text: "Never appear too perfect.", author: "Robert Greene" },
  { text: "Do not go past the mark you aimed for; in victory, learn when to stop.", author: "Robert Greene" },
  { text: "Assume formlessness.", author: "Robert Greene" }
];

const JAMES_ALLEN_QUOTES = [
  { text: "A man is literally what he thinks, his character being the complete sum of all his thoughts.", author: "James Allen" },
  { text: "As a man thinketh in his heart, so is he.", author: "James Allen" },
  { text: "Mind is the Master power that moulds and makes, And Man is Mind, and evermore he takes The tool of Thought, and, shaping what he wills, Brings forth a thousand joys, a thousand ills: — He thinks in secret, and it comes to pass: Environment is but his looking-glass.", author: "James Allen" },
  { text: "Cherish your visions; cherish your ideals; cherish the music that stirs in your heart, the beauty that forms in your mind, the loveliness that drapes your purest thoughts, for out of them will grow all delightful conditions, all heavenly environment; of these, if you but remain true to them, your world will at last be built.", author: "James Allen" },
  { text: "The soul attracts that which it secretly harbours; that which it loves, and also that which it fears.", author: "James Allen" },
  { text: "Men are anxious to improve their circumstances, but are unwilling to improve themselves; they therefore remain bound.", author: "James Allen" },
  { text: "A man only begins to be a man when he ceases to whine and revile, and commences to search for the hidden justice which regulates his life.", author: "James Allen" },
  { text: "Self-control is strength; Right Thought is mastery; Calmness is power.", author: "James Allen" },
  { text: "The more tranquil a man becomes, the greater is his success, his influence, his power for good.", author: "James Allen" },
  { text: "Dream lofty dreams, and as you dream, so shall you become.", author: "James Allen" },
  { text: "He who would accomplish little must sacrifice little; he who would achieve much must sacrifice much; he who would attain highly must sacrifice greatly.", author: "James Allen" },
  { text: "Circumstance does not make the man; it reveals him to himself.", author: "James Allen" },
  { text: "You are today where your thoughts have brought you; you will be tomorrow where your thoughts take you.", author: "James Allen" },
  { text: "Calmness of mind is one of the beautiful jewels of wisdom.", author: "James Allen" },
  { text: "Thought and character are one.", author: "James Allen" },
  { text: "The outer conditions of a person's life will always be found to be harmoniously related to his inner state.", author: "James Allen" },
  { text: "Good thoughts and actions can never produce bad results; bad thoughts and actions can never produce good results.", author: "James Allen" },
  { text: "The vision that you glorify in your mind, the ideal that you enthrone in your heart—this you will build your life by; this you will become.", author: "James Allen" }
];

const ALL_QUOTES = [...DALE_CARNEGIE_QUOTES, ...ROBERT_GREENE_QUOTES, ...JAMES_ALLEN_QUOTES];

const ReminderModal = ({ 
  onClose, 
  onSave, 
  reminders 
}: { 
  onClose: () => void; 
  onSave: (time: string, days: string[]) => void;
  reminders: { id: string; time: string; days: string[] }[]
}) => {
  const [time, setTime] = useState("08:00");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight font-display">Study Reminder</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Stay on track with your revision</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-3 h-3" /> Set Time
          </label>
          <input 
            type="time" 
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 outline-none text-2xl font-black text-slate-900 dark:text-slate-100 transition-all"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Select Days
          </label>
          <div className="flex flex-wrap gap-2">
            {days.map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black transition-all border-2",
                  selectedDays.includes(day)
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-emerald-200"
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button 
            className="w-full py-4 rounded-2xl text-base"
            onClick={() => onSave(time, selectedDays)}
            leftIcon={<CheckCircle2 className="w-5 h-5" />}
          >
            Save Reminder
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const QuoteSection = () => {
  const [quote, setQuote] = useState({ text: "", author: "" });

  useEffect(() => {
    const randomQuote = ALL_QUOTES[Math.floor(Math.random() * ALL_QUOTES.length)];
    setQuote(randomQuote);
  }, []);

  const refreshQuote = () => {
    const randomQuote = ALL_QUOTES[Math.floor(Math.random() * ALL_QUOTES.length)];
    setQuote(randomQuote);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
        <Quote className="w-32 h-32 text-emerald-600" />
      </div>
      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] flex items-center justify-center text-emerald-600 shadow-inner">
          <Quote className="w-8 h-8" />
        </div>
        <div className="max-w-3xl">
          <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-200 italic leading-tight tracking-tight font-display">
            "{quote.text}"
          </p>
          <div className="mt-6 flex flex-col items-center">
            <div className="flex items-center gap-4">
              <div className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
              <p className="font-black text-emerald-600 uppercase tracking-[0.2em] text-[10px]">— {quote.author}</p>
              <div className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
            </div>
            <Button 
              variant="ghost"
              size="sm"
              onClick={refreshQuote}
              className="mt-4 text-slate-400 hover:text-emerald-500 transition-colors rounded-full h-10 w-10 p-0"
              title="New Inspiration"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Wisdom for Success</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const isConfigured = import.meta.env.VITE_SUPABASE_URL && 
                    !import.meta.env.VITE_SUPABASE_URL.includes('placeholder') &&
                    import.meta.env.VITE_SUPABASE_ANON_KEY &&
                    !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('placeholder');

const AuthForm = ({ mode: initialMode, onClose, onSuccess }: { mode: 'login' | 'register', onClose: () => void, onSuccess: () => void }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) {
      setError('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Secrets menu.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Registration successful! Please check your email for verification.');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="glass" padding="lg" className="w-full max-w-md relative">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClose} 
        className="absolute top-6 right-6 rounded-full"
      >
        <X className="w-5 h-5 text-slate-400" />
      </Button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4">
          {mode === 'login' ? <LogIn className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />}
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight font-display">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          {mode === 'login' ? 'Sign in to access your saved notes and progress' : 'Join Green Book to sync your learning across devices'}
        </p>
      </div>

      {!isConfigured && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
          <p className="font-bold mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Backend Not Configured
          </p>
          To enable login and cloud sync, you need to set your Supabase credentials in the **Secrets** menu (bottom left).
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          placeholder="you@example.com"
        />

        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          placeholder="••••••••"
        />

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-bold">
            <XCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {mode === 'login' && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setEmail('wgmasvix@gmail.com');
              setPassword('2126');
            }}
            className="w-full py-2 text-xs border-dashed border-emerald-200 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
          >
            Use Demo Credentials
          </Button>
        )}

        <Button
          type="submit"
          loading={loading}
          className="w-full py-4"
          leftIcon={!loading && <Sparkles className="w-5 h-5" />}
        >
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </Button>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </form>
    </Card>
  );
};

const SettingsView = ({ user, isDarkMode, setIsDarkMode, onLogout, onLogin, onResetSession }: { 
  user: any, 
  isDarkMode: boolean, 
  setIsDarkMode: (val: boolean) => void, 
  onLogout: () => void,
  onLogin: () => void,
  onResetSession: () => void
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8 pb-32"
    >
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl relative group">
          <User className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {user ? user.email.split('@')[0] : 'Guest Student'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {user ? user.email : 'Sign in to sync your progress'}
          </p>
        </div>
        {!user && (
          <Button 
            onClick={onLogin}
            className="rounded-full px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20"
          >
            Sign In / Register
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Account Settings</h3>
          
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Email Address</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || 'Not connected'}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Security & Privacy</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Manage your password and data</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Green Book HBC Assistant',
                    text: 'Check out this amazing study assistant for Zimbabwean students!',
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-600 dark:text-pink-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Share App</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Invite your classmates to study</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Data Management</h3>
          
          <div className="space-y-2">
            <button 
              onClick={() => {
                if (window.confirm('Start a new study session? This will reset your current progress but keep your saved library items.')) {
                  onResetSession();
                }
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">New Study Session</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Reset context for fresh content</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to clear the app cache? This will not delete your saved library items.')) {
                  localStorage.removeItem('app_cache');
                  window.location.reload();
                }
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Clear App Cache</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Free up space and refresh data</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            <button 
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Sync Progress</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Force a manual sync with cloud</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Preferences</h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Adjust the app's appearance</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  isDarkMode ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                  isDarkMode ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Manage your study reminders</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Support & Legal</h3>
          
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Help Center</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">FAQs and support guides</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Terms of Service</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Read our legal agreements</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          </div>
        </div>

        {user && (
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-6 rounded-3xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-black uppercase tracking-[0.2em] text-xs hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Account
          </button>
        )}
      </div>

      <div className="text-center space-y-2 pt-8">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Green Book HBC Assistant</p>
        <p className="text-[10px] text-slate-400">Version 2.1.0 (Build 2026.03.31)</p>
      </div>
    </motion.div>
  );
};

const BottomNav = ({ activeTab, onTabChange }: { activeTab: 'learn' | 'library' | 'settings', onTabChange: (tab: 'learn' | 'library' | 'settings') => void }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-900 z-50 px-6 py-3 pb-8 flex items-center justify-between">
      {[
        { id: 'learn', label: 'Learn', icon: <GraduationCap className="w-6 h-6" /> },
        { id: 'library', label: 'Library', icon: <History className="w-6 h-6" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="w-6 h-6" /> },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id as any)}
          className={cn(
            "relative flex flex-col items-center gap-1 transition-all",
            activeTab === tab.id 
              ? "text-emerald-600 dark:text-emerald-400 scale-110" 
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="bottom-nav-active"
              className="absolute -top-1 w-12 h-1 bg-emerald-500 rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <div className={cn(
            "p-2 rounded-2xl transition-all",
            activeTab === tab.id ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
          )}>
            {tab.icon}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isReaderMode, setIsReaderMode] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncingPublic, setSyncingPublic] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => localStorage.getItem('last_sync_time'));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };
  const [pendingSync, setPendingSync] = useState<{ type: 'save' | 'delete', data: any }[]>(() => {
    const saved = localStorage.getItem('pending_sync');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('pending_sync', JSON.stringify(pendingSync));
    if (isOnline && user && pendingSync.length > 0) {
      processPendingSync();
    }
  }, [pendingSync, isOnline, user]);

  const processPendingSync = async () => {
    const queue = [...pendingSync];
    for (const action of queue) {
      try {
        if (action.type === 'save') {
          await supabase.from('saved_materials').insert([action.data]);
        } else if (action.type === 'delete') {
          await supabase.from('saved_materials').delete().eq('id', action.data.id).eq('user_id', user.id);
        }
        setPendingSync(prev => prev.filter(a => a !== action));
      } catch (err) {
        console.error('Failed to sync action:', action, err);
        break; // Stop processing if one fails (likely network error again)
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      // 1. Check Auth
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // 2. Auto Login if needed
      if (!session && isConfigured) {
        try {
          await supabase.auth.signInWithPassword({
            email: 'wgmasvix@gmail.com',
            password: '2126'
          });
        } catch (err) {
          console.warn('Auto-login failed:', err);
        }
      }

      // 3. Initial Data Fetch
      if (isOnline) {
        try {
          // Use a timeout for initial data fetch to prevent getting stuck on splash screen
          const fetchPromise = Promise.allSettled([
            fetchPublicMaterials(),
            session?.user ? syncLibraryWithSupabase() : Promise.resolve()
          ]);
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Init timeout')), 10000)
          );

          await Promise.race([fetchPromise, timeoutPromise]);
        } catch (err) {
          console.warn('Initial data fetch timed out or failed:', err);
        }
      }

      // 4. Finish Initialization
      setIsInitializing(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // TASK 4: PREVENT INFINITE LOADING - Fallback to ensure loading state is cleared
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setIsInitializing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // TASK 5: ADD SUPABASE CONNECTION TEST
  useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('saved_materials') // Using an existing table to test
          .select('*')
          .limit(1);
        
        console.log("SUPABASE CONNECTION TEST - DATA:", data);
        if (error) {
          console.error("SUPABASE CONNECTION TEST - ERROR:", error);
        } else {
          console.log("SUPABASE CONNECTION TEST - SUCCESS");
        }
      } catch (err) {
        console.error("SUPABASE CONNECTION TEST - EXCEPTION:", err);
      }
    };

    if (isConfigured) {
      testSupabaseConnection();
    }
  }, []);

  useEffect(() => {
    if (user && !isInitializing) {
      syncLibraryWithSupabase();
    }
    if (isOnline && !isInitializing) {
      fetchPublicMaterials();
    }
  }, [user, isOnline, isInitializing]);

  const syncLibraryWithSupabase = async () => {
    if (!user || !isOnline) return;
    setIsSyncing(true);
    try {
      const { data, error } = await supabase
        .from('saved_materials')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      if (data) {
        setLibrary(prev => {
          const combined = [...data, ...prev];
          const seen = new Set();
          const unique = combined.filter(item => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
          return unique;
        });
        const now = new Date().toISOString();
        setLastSyncTime(now);
        localStorage.setItem('last_sync_time', now);
      }
    } catch (error) {
      console.error('Error syncing with Supabase:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  const [library, setLibrary] = useState<SavedMaterial[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('library');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Deduplicate by ID just in case
        const seen = new Set();
        return parsed.filter((item: any) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
      }
      return [];
    }
    return [];
  });
  const [drafts, setDrafts] = useState<Draft[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('drafts');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [activeTab, setActiveTab] = useState<'learn' | 'library' | 'settings'>('learn');
  const [libraryTab, setLibraryTab] = useState<'saved' | 'drafts' | 'guides' | 'flashcards' | 'papers' | 'textbooks'>('saved');

  useEffect(() => {
    localStorage.setItem('library', JSON.stringify(library));
  }, [library]);

  useEffect(() => {
    localStorage.setItem('drafts', JSON.stringify(drafts));
  }, [drafts]);

  const handleSaveDraft = (content: string, type: ContentType) => {
    if (!subject) {
      alert("Please select a subject first.");
      return;
    }
    
    const newDraft: Draft = {
      id: crypto.randomUUID(),
      subject,
      level,
      grade,
      contentType: type,
      difficulty,
      topic: topic || studentInput || "Untitled Draft",
      content,
      timestamp: Date.now()
    };
    
    setDrafts(prev => [newDraft, ...prev]);
    alert("Draft saved to library!");
  };

  const deleteDraft = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
  };

  const loadDraft = (draft: Draft) => {
    setSubject(draft.subject);
    setLevel(draft.level);
    setGrade(draft.grade);
    setContentType(draft.contentType);
    if (draft.difficulty) setDifficulty(draft.difficulty);
    setTopic(draft.topic);
    if (draft.contentType === "Notes") {
      setUserNotes(draft.content);
      setShowNotes(true);
    } else {
      setStudentInput(draft.content);
    }
    setActiveTab('learn');
    setStep(3);
  };

  const handleSaveToLibrary = async () => {
    if (!user) {
      setAuthMode('login');
      setShowAuth(true);
      return;
    }
    if (!subject || !contentType || !result) return;
    
    const newMaterial: SavedMaterial = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      subject,
      level,
      grade,
      contentType,
      difficulty,
      topic: topic || studentInput || "General",
      content: result,
      generatedImage,
      audioUrl: audioUrl,
      timestamp: Date.now()
    };
    
    // Log interaction
    await logInteraction('save_to_library', {
      id: newMaterial.id,
      subject,
      level,
      grade,
      contentType,
      topic: newMaterial.topic
    });
    
    setLibrary(prev => {
      const combined = [newMaterial, ...prev];
      const seen = new Set();
      return combined.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    });

    if (user) {
      const syncData = { ...newMaterial, user_id: user.id };
      await logInteraction('save_material', { materialId: newMaterial.id, topic: newMaterial.topic, contentType: newMaterial.contentType });
      if (isOnline) {
        try {
          const { error } = await supabase
            .from('saved_materials')
            .insert([syncData]);
          if (error) throw error;
        } catch (error) {
          console.error('Error saving to Supabase, adding to pending:', error);
          setPendingSync(prev => [...prev, { type: 'save', data: syncData }]);
        }
      } else {
        setPendingSync(prev => [...prev, { type: 'save', data: syncData }]);
      }
    }
    
    alert("Saved to library!");
  };

  const deleteFromLibrary = async (id: string) => {
    await logInteraction('delete_material', { materialId: id });
    setLibrary(prev => prev.filter(item => item.id !== id));
    if (user) {
      if (isOnline) {
        try {
          const { error } = await supabase
            .from('saved_materials')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
          if (error) throw error;
        } catch (error) {
          console.error('Error deleting from Supabase, adding to pending:', error);
          setPendingSync(prev => [...prev, { type: 'delete', data: { id } }]);
        }
      } else {
        setPendingSync(prev => [...prev, { type: 'delete', data: { id } }]);
      }
    }
  };

  const openFromLibrary = (item: SavedMaterial) => {
    setSubject(item.subject);
    setLevel(item.level);
    setGrade(item.grade);
    setContentType(item.contentType);
    if (item.difficulty) setDifficulty(item.difficulty);
    setTopic(item.topic);
    setResult(item.content);
    setGeneratedImage(item.generatedImage);
    setActiveTab('learn');
    setStep(4);
  };
  const [subject, setSubject] = useState<Subject | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('current_subject');
      return saved ? saved as Subject : null;
    }
    return null;
  });
  const [level, setLevel] = useState<Level>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('current_level');
      return saved ? saved as Level : "O-Level";
    }
    return "O-Level";
  });
  const [grade, setGrade] = useState<Grade>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('current_grade');
      return saved ? saved as Grade : "Form 4";
    }
    return "Form 4";
  });
  const [contentType, setContentType] = useState<ContentType | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('current_contentType');
      return saved ? saved as ContentType : null;
    }
    return null;
  });
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('current_difficulty');
      return saved ? saved as Difficulty : "Medium";
    }
    return "Medium";
  });
  const [topic, setTopic] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('current_topic') || "";
    }
    return "";
  });
  const [topicSearch, setTopicSearch] = useState("");
  const [contentSearch, setContentSearch] = useState("");
  const [studentInput, setStudentInput] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('current_studentInput') || "";
    }
    return "";
  });
  const [image, setImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('current_result');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [userNotes, setUserNotes] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('current_userNotes') || "";
    }
    return "";
  });
  const [showNotes, setShowNotes] = useState(false);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [textbooks, setTextbooks] = useState<{ name: string; url: string }[]>(() => {
    const saved = localStorage.getItem('cached_textbooks');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedTextbook, setSelectedTextbook] = useState<string | null>(null);
  const [verifyWithTextbook, setVerifyWithTextbook] = useState(false);
  const [loadingTextbook, setLoadingTextbook] = useState(false);
  const [verifiedBy, setVerifiedBy] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [publicMaterials, setPublicMaterials] = useState<SavedMaterial[]>([]);
  const [showCloudLibrary, setShowCloudLibrary] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [streak, setStreak] = useState(1);
  const [reminders, setReminders] = useState<{ id: string; time: string; days: string[] }[]>([]);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('app_session_id');
      if (saved) return saved;
      const newId = crypto.randomUUID();
      sessionStorage.setItem('app_session_id', newId);
      return newId;
    }
    return crypto.randomUUID();
  });

  const resetSession = () => {
    const newId = crypto.randomUUID();
    setSessionId(newId);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('app_session_id', newId);
    }
    setStep(1);
    setSubject(null);
    setTopic("");
    setResult(null);
    setLoading(false);
    setGeneratingAudio(false);
    setAudioUrl(null);
    setGenerationError(null);
    setVerifiedBy(null);
    setSuggestedTopics([]);
    setUserNotes("");
    setShowNotes(false);
    logInteraction('session_reset', { previousSessionId: sessionId, newSessionId: newId });
  };

  const logInteraction = async (eventType: string, details: any) => {
    const interaction = {
      id: crypto.randomUUID(),
      user_id: user?.id || null,
      session_id: sessionId,
      event_type: eventType,
      details,
      timestamp: Date.now()
    };

    try {
      if (isOnline) {
        await supabase.from('user_interactions').insert([interaction]);
      }
    } catch (err) {
      console.error('Error logging interaction:', err);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      // Check for environment variable first
      if (import.meta.env.VITE_DEEPSEEK_API_KEY) {
        setHasApiKey(true);
        return;
      }

      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(selected);
        } catch (err) {
          console.error('Error checking API key:', err);
          setHasApiKey(false);
        }
      } else {
        setHasApiKey(false);
      }
    };
    checkApiKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  useEffect(() => {
    const fetchTextbooks = async () => {
      if (!isConfigured || !isOnline) return;
      try {
        const { data, error } = await supabase.storage.from('textbooks').list();
        if (error) {
          console.warn('Textbooks bucket not found or inaccessible:', error.message);
          return;
        }
        if (data) {
          const books = data.map(file => ({
            name: file.name,
            url: supabase.storage.from('textbooks').getPublicUrl(file.name).data.publicUrl
          }));
          setTextbooks(books);
          localStorage.setItem('cached_textbooks', JSON.stringify(books));
        }
      } catch (err) {
        console.error('Error fetching textbooks:', err);
      }
    };
    fetchTextbooks();
  }, [isConfigured, isOnline]);

  useEffect(() => {
    if (subject) localStorage.setItem('current_subject', subject);
    localStorage.setItem('current_level', level);
    localStorage.setItem('current_grade', grade);
    if (contentType) localStorage.setItem('current_contentType', contentType);
    localStorage.setItem('current_difficulty', difficulty);
    localStorage.setItem('current_topic', topic);
    localStorage.setItem('current_studentInput', studentInput);
    localStorage.setItem('current_userNotes', userNotes);
    if (result) localStorage.setItem('current_result', JSON.stringify(result));
    else localStorage.removeItem('current_result');
  }, [subject, level, grade, contentType, difficulty, topic, studentInput, userNotes, result]);

  const handleDownloadResult = () => {
    if (!result) return;
    
    logInteraction('download_result', {
      subject,
      level,
      grade,
      contentType,
      topic
    });
    
    let content = "";
    if (contentType === "Quiz") {
      content = result.map((q: any, i: number) => 
        `Q${i+1}: ${q.question}\nOptions: ${q.options.join(', ')}\nCorrect: ${q.options[q.correctAnswer]}\nExplanation: ${q.explanation}\n\n`
      ).join('');
    } else if (contentType === "Flashcards") {
      content = result.map((f: any, i: number) => 
        `Card ${i+1}\nFront: ${f.front}\nBack: ${f.back}\n\n`
      ).join('');
    } else {
      content = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GreenBook_${subject}_${contentType}_${topic || 'Study_Material'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportLibrary = () => {
    const data = {
      library,
      drafts,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GreenBook_Library_Backup_${new Date().toLocaleDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSuggestTopics = async () => {
    if (!subject) return;
    setLoadingTopics(true);
    try {
      const topics = await suggestTopics(subject, level, grade);
      setSuggestedTopics(topics);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleGenerate = async () => {
    if (!subject || !contentType) return;
    
    // Check for premium content
    const isPremium = CONTENT_TYPES.find(ct => ct.id === contentType)?.premium;
    if (isPremium && !user) {
      setAuthMode('login');
      setShowAuth(true);
      return;
    }

    setLoading(true);
    setGenerationError(null);
    setResult(null);
    setGeneratedImage(null);
    setVerifiedBy(null);
    try {
      let referenceContent = undefined;
      if (verifyWithTextbook && selectedTextbook) {
        setLoadingTextbook(true);
        try {
          const book = textbooks.find(b => b.name === selectedTextbook);
          if (book) {
            const response = await fetch(book.url);
            if (response.ok) {
              referenceContent = await response.text();
              // Limit reference content to avoid token limits (approx 10k chars)
              referenceContent = referenceContent.slice(0, 10000);
              setVerifiedBy(selectedTextbook);
            }
          }
        } catch (err) {
          console.error('Failed to fetch reference textbook:', err);
        } finally {
          setLoadingTextbook(false);
        }
      }

      // Generate text content
      const data = await generateExamContent({
        subject,
        level,
        grade,
        contentType,
        difficulty,
        topic,
        studentInput,
        image: image || undefined,
        referenceContent,
        sessionId
      });
      setResult(data);

      // Log interaction
      await logInteraction('generate_content', {
        subject,
        level,
        grade,
        contentType,
        difficulty,
        topic,
        hasImage: !!image,
        hasReference: !!referenceContent
      });

      // Generate image for art-related subjects
      const artSubjects: Subject[] = ["Visual and Performing Arts", "Textile and Design Technology", "Music", "Film", "Horticulture", "Crop Science"];
      if (artSubjects.includes(subject) && topic) {
        try {
          const img = await generateImage(`${subject}: ${topic}`);
          setGeneratedImage(img);
        } catch (imgError) {
          console.error("Image generation failed:", imgError);
        }
      }

      setStep(4);
    } catch (error: any) {
      console.error(error);
      setGenerationError(error.message || "An unexpected error occurred while generating content. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('public_materials')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      if (data) setPublicMaterials(data);
    } catch (err) {
      console.error('Error fetching public materials:', err);
    }
  };

  const syncOfflineContentToSupabase = async () => {
    if (!user || user.email !== 'wgmasvix@gmail.com') {
      alert("Only administrators can publish content to the cloud library.");
      return;
    }

    setSyncingPublic(true);
    try {
      // Prepare all offline content for upload
      const allContent: Partial<SavedMaterial>[] = [
        ...OFFLINE_TEXTBOOKS.map(b => ({
          id: b.id,
          subject: b.subject as Subject,
          level: 'O-Level' as Level,
          grade: 'Form 4' as Grade,
          contentType: 'Textbook Chapter' as ContentType,
          topic: b.topic,
          content: b.content,
          timestamp: Date.now()
        })),
        ...OFFLINE_PAPERS.map(p => ({
          id: p.id,
          subject: p.subject as Subject,
          level: 'O-Level' as Level,
          grade: 'Form 4' as Grade,
          contentType: 'Practice Paper' as ContentType,
          topic: p.topic,
          content: p.content,
          timestamp: Date.now()
        })),
        ...OFFLINE_FLASHCARDS.map(fc => ({
          id: fc.id,
          subject: fc.subject as Subject,
          level: 'O-Level' as Level,
          grade: 'Form 4' as Grade,
          contentType: 'Flashcards' as ContentType,
          topic: fc.topic,
          content: fc.cards,
          timestamp: Date.now()
        })),
        ...OFFLINE_GUIDES.map(g => ({
          id: g.id,
          subject: g.subject as Subject,
          level: 'O-Level' as Level,
          grade: 'Form 4' as Grade,
          contentType: 'Notes' as ContentType,
          topic: g.topic,
          content: g.content,
          timestamp: Date.now()
        }))
      ];

      // Upload in batches
      for (const item of allContent) {
        const { error } = await supabase
          .from('public_materials')
          .upsert([item], { onConflict: 'id' });
        
        if (error) console.error(`Error uploading ${item.topic}:`, error);
      }

      alert("Successfully published all offline content to the Supabase Cloud Library!");
      fetchPublicMaterials();
    } catch (err: any) {
      alert("Failed to sync content: " + err.message);
    } finally {
      setSyncingPublic(false);
    }
  };

  const downloadFromCloud = async (material: SavedMaterial) => {
    if (library.some(m => m.id === material.id)) {
      alert("This material is already in your library.");
      return;
    }

    const newMaterial = { ...material, timestamp: Date.now(), session_id: sessionId };
    setLibrary(prev => [newMaterial, ...prev]);
    
    if (user && isOnline) {
      await supabase.from('saved_materials').insert([{ ...newMaterial, user_id: user.id }]);
    }
    
    await logInteraction('download_from_cloud', { materialId: material.id, topic: material.topic });
    alert(`Successfully downloaded "${material.topic}" to your library!`);
  };

  const handleLogout = async () => {
    await logInteraction('auth_logout', { timestamp: Date.now() });
    await supabase.auth.signOut();
    setLibrary([]); // Clear local library on logout
    localStorage.removeItem('library');
  };

  const handleSaveReminder = (time: string, days: string[]) => {
    const newReminder = { id: crypto.randomUUID(), time, days };
    setReminders(prev => [...prev, newReminder]);
    setShowRemindersModal(false);
    // In a real app, we would schedule a local notification here
  };

  const reset = () => {
    setStep(1);
    setSubject(null);
    setSubjectSearch("");
    setLevel("O-Level");
    setGrade("Form 4");
    setContentType(null);
    setDifficulty("Medium");
    setTopic("");
    setTopicSearch("");
    setContentSearch("");
    setStudentInput("");
    setImage(null);
    setGeneratedImage(null);
    setResult(null);
    setVerifiedBy(null);
    setSuggestedTopics([]);
    setUserNotes("");
    setShowNotes(false);
  };

  const handleGenerateAudio = async () => {
    if (!isOnline) {
      alert("Audio generation requires an internet connection.");
      return;
    }
    if (!user) {
      setAuthMode('login');
      setShowAuth(true);
      return;
    }
    if (!result) return;
    setGeneratingAudio(true);
    await logInteraction('generate_audio_start', { contentType, topic });
    try {
      let textToExplain = "";
      if (typeof result === 'string') {
        textToExplain = result;
      } else if (Array.isArray(result)) {
        // Format Quiz or Flashcards for better audio explanation
        if (contentType === 'Quiz') {
          textToExplain = `This is a quiz about ${topic || subject}. ` + 
            result.map((q: QuizQuestion, i: number) => `Question ${i + 1}: ${q.question}. Options are: ${q.options.join(', ')}. The correct answer is option ${q.correctAnswer + 1}: ${q.options[q.correctAnswer]}.`).join(' ');
        } else if (contentType === 'Flashcards') {
          textToExplain = `Here are some flashcards for ${topic || subject}. ` + 
            result.map((f: Flashcard) => `Question: ${f.question}. Answer: ${f.answer}.`).join(' ');
        } else {
          textToExplain = JSON.stringify(result);
        }
      } else {
        textToExplain = JSON.stringify(result);
      }

      const url = await generateAudioExplanation(textToExplain);
      if (url) {
        setAudioUrl(url);
        await logInteraction('generate_audio_success', { contentType, topic });
      }
    } catch (error) {
      console.error('Audio generation failed:', error);
      await logInteraction('generate_audio_error', { error: String(error) });
    } finally {
      setGeneratingAudio(false);
    }
  };
  const downloadNotes = () => {
    const element = document.createElement("a");
    const file = new Blob([userNotes], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `GreenBookHBC_Notes_${subject}_${topic || 'General'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const StepIndicator = () => {
    const steps = [
      { id: 1, label: "Level", icon: <Layers className="w-4 h-4" /> },
      { id: 2, label: "Subject", icon: <BookOpen className="w-4 h-4" /> },
      { id: 3, label: "Content", icon: <Zap className="w-4 h-4" /> },
      { id: 4, label: "Result", icon: <Sparkles className="w-4 h-4" /> }
    ];

    return (
      <div className="flex items-center justify-center mb-8 px-4">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div 
                className={cn(
                  "relative flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all z-10",
                  step === s.id 
                    ? "text-white" 
                    : step > s.id 
                      ? "text-emerald-600 dark:text-emerald-400" 
                      : "text-slate-400 dark:text-slate-600"
                )}
              >
                {step === s.id && (
                  <motion.div
                    layoutId="step-indicator-active"
                    className="absolute inset-0 bg-emerald-500 shadow-lg shadow-emerald-500/20 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black",
                  step === s.id ? "bg-white/20" : step > s.id ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-slate-100 dark:bg-slate-800"
                )}>
                  {step > s.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.id}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  "w-4 h-0.5 rounded-full transition-colors",
                  step > s.id ? "bg-emerald-500" : "bg-slate-100 dark:bg-slate-800"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-950 flex flex-col items-center justify-center z-[1000]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-[2rem] bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/20 relative z-10 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=200&h=200" 
                alt="Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-emerald-500 rounded-[2rem] blur-2xl -z-10"
            />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-emerald-950 dark:text-emerald-50 tracking-tighter uppercase font-display">
              Green<span className="text-emerald-500">Book</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-emerald-800/40 dark:text-emerald-400/40 mt-1">HBC Assistant</p>
          </div>
          <div className="flex gap-1 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-emerald-500"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-950 flex flex-col items-center justify-center z-[1000] p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="relative w-24 h-24 mx-auto">
            <Loader2 className="w-full h-full text-emerald-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-emerald-600 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight font-display">
              Generating Content
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Our AI is crafting your Heritage-Based Curriculum materials. This usually takes 10-30 seconds.
            </p>
          </div>

          <div className="pt-4">
            <Button 
              variant="outline" 
              onClick={() => setLoading(false)}
              className="px-8 border-slate-200 dark:border-slate-800 text-slate-500"
            >
              Cancel & Return
            </Button>
          </div>

          <div className="pt-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Powered by ChengetAI
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Configuration Warning */}
      {!isConfigured && (
        <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1 text-center sticky top-0 z-[60] flex items-center justify-center gap-2">
          <AlertTriangle className="w-3 h-3" />
          Backend Not Configured
          <button 
            onClick={() => setShowSetupGuide(true)}
            className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors"
          >
            How to setup?
          </button>
          <AlertTriangle className="w-3 h-3" />
        </div>
      )}

      {hasApiKey === false && (
        <div className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1 text-center sticky top-0 z-[60] flex items-center justify-center gap-3">
          <Zap className="w-3 h-3 animate-pulse" />
          ChengetAI API Key Required
          <div className="flex gap-2">
            <button 
              onClick={handleOpenKeyDialog}
              className="bg-white text-blue-600 px-3 py-0.5 rounded-full font-black hover:bg-blue-50 transition-colors"
            >
              Setup Now
            </button>
            <button 
              onClick={() => setShowSetupGuide(true)}
              className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors"
            >
              Guide
            </button>
          </div>
          <Zap className="w-3 h-3 animate-pulse" />
        </div>
      )}

      {!isOnline && (
        <div className="bg-amber-600 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1.5 text-center sticky top-0 z-[60] flex items-center justify-center gap-3 shadow-lg">
          <CloudOff className="w-3.5 h-3.5" />
          Offline Mode: AI Generation Disabled
          <div className="flex gap-2">
            <button 
              onClick={() => { setActiveTab('library'); setStep(1); }}
              className="bg-white text-amber-600 px-3 py-0.5 rounded-full font-black hover:bg-amber-50 transition-colors"
            >
              Use Offline Library
            </button>
          </div>
          <CloudOff className="w-3.5 h-3.5" />
        </div>
      )}
      
      {/* Setup Guide Modal */}
      <AnimatePresence>
        {showSetupGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Setup Guide</h2>
                </div>
                <button onClick={() => setShowSetupGuide(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* ChengetAI Setup */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Zap className="w-5 h-5" />
                    <h3 className="font-black uppercase tracking-widest text-sm">1. ChengetAI API Key</h3>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <p>To generate content, you need a ChengetAI API key. You can set it in two ways:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Click the <span className="font-bold text-blue-600">"Setup Now"</span> button in the blue banner at the top.</li>
                      <li>Or, open the <span className="font-bold">Secrets</span> panel in the AI Studio sidebar and add <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">VITE_DEEPSEEK_API_KEY</code>.</li>
                    </ul>
                    <p className="text-xs italic">Get your key from <a href="https://api.deepseek.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">DeepSeek</a>.</p>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                {/* Supabase Setup */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <Database className="w-5 h-5" />
                    <h3 className="font-black uppercase tracking-widest text-sm">2. Backend (Supabase)</h3>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <p>To enable Login, Sync, and Library features, you need a Supabase project:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-amber-500 underline">Supabase</a> and create a project.</li>
                      <li>In AI Studio sidebar, open <span className="font-bold">Secrets</span>.</li>
                      <li>Add <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>.</li>
                    </ol>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-500">Note: You can still use the app offline without this!</p>
                  </div>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                {/* Seed Data Section Removed */}
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                <Button onClick={() => setShowSetupGuide(false)} className="w-full py-3">
                  Got it!
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-yellow-400/10 dark:bg-yellow-400/5 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] animate-blob animation-delay-4000" />
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
      
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
        {activeTab === 'learn' && step > 1 && (
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-900">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            />
          </div>
        )}
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={reset}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xl relative z-10 overflow-hidden border-2 border-white dark:border-slate-800 bg-emerald-100 dark:bg-emerald-900/30">
                  <img 
                    src="https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=100&h=100" 
                    alt="Logo"
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-black text-xl tracking-tight text-emerald-950 dark:text-emerald-50 leading-none flex items-center gap-1">
                  <span className="text-emerald-500">Green</span>Book
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                    <div className="w-1 h-1 rounded-full bg-yellow-400" />
                    <div className="w-1 h-1 rounded-full bg-emerald-600" />
                  </div>
                  <p className="text-[8px] uppercase tracking-[0.2em] font-black text-emerald-800/60 dark:text-emerald-400/60">HBC ASSISTANT</p>
                </div>
              </div>
            </motion.div>

            <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl relative">
              {[
                { id: 'learn', label: 'Learn', icon: <GraduationCap className="w-3.5 h-3.5" />, active: activeTab === 'learn' },
                { id: 'library', label: 'Library', icon: <History className="w-3.5 h-3.5" />, active: activeTab === 'library' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'learn') { setActiveTab('learn'); setStep(1); }
                    else setActiveTab('library');
                  }}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors z-10",
                    tab.active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.active && (
                    <motion.div
                      layoutId="header-nav-active"
                      className="absolute inset-0 bg-white dark:bg-slate-800 rounded-lg shadow-sm -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all",
              isOnline 
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50" 
                : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50 animate-pulse"
            )}>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                isOnline ? "bg-emerald-500" : "bg-amber-500"
              )} />
              {isOnline ? "Online" : "Offline Mode"}
              {!isOnline && pendingSync.length > 0 && (
                <span className="ml-1 px-1.5 bg-amber-500 text-white rounded-full text-[7px]">{pendingSync.length}</span>
              )}
            </div>

            {isOnline && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={syncLibraryWithSupabase}
                disabled={isSyncing}
                className={cn(
                  "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border",
                  isSyncing 
                    ? "bg-emerald-500 text-white border-emerald-400" 
                    : "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50 hover:border-emerald-500"
                )}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <CloudDownload className="w-3.5 h-3.5" />
                    Sync Cloud
                  </>
                )}
              </motion.button>
            )}

            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-yellow-400 hidden sm:block"
            >
              <Sparkles className="w-5 h-5 fill-current" />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowRemindersModal(true)}
              className="text-slate-400 hover:text-emerald-500 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {reminders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900" />
              )}
            </motion.button>

            {(!hasApiKey || !isConfigured) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSetupGuide(true)}
                className="hidden sm:flex border-amber-200 text-amber-600 dark:border-amber-900/50 dark:text-amber-400 h-8 text-[10px] font-black uppercase tracking-widest"
                leftIcon={<Settings className="w-3.5 h-3.5" />}
              >
                Setup
              </Button>
            )}

            <div className="bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 group cursor-help" title="Your study streak!">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  filter: ["drop-shadow(0 0 0px #10b981)", "drop-shadow(0 0 8px #10b981)", "drop-shadow(0 0 0px #10b981)"]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-emerald-600 dark:text-emerald-400"
              >
                <Zap className="w-4 h-4 fill-current" />
              </motion.div>
              <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">{streak}</span>
            </div>

            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-full"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {user ? (
              <Button 
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:text-red-500 rounded-full"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            ) : (
              <Button 
                variant="primary"
                size="sm"
                onClick={() => { setAuthMode('login'); setShowAuth(true); }}
                className="rounded-xl px-4 h-9 text-[10px] font-black uppercase tracking-widest"
                leftIcon={<LogIn className="w-3.5 h-3.5" />}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {activeTab === 'learn' && step > 1 && <StepIndicator />}
        
        <div className="mb-6 flex items-center justify-between">
          {activeTab === 'learn' && step > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((step - 1) as any)}
              className="text-slate-500 hover:text-emerald-600 font-black text-[10px] uppercase tracking-widest"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          )}
        </div>
        <AnimatePresence mode="wait">
          {showRemindersModal ? (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
              <ReminderModal 
                onClose={() => setShowRemindersModal(false)} 
                onSave={handleSaveReminder}
                reminders={reminders}
              />
            </div>
          ) : null}
          {showAuth ? (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
              <AuthForm 
                mode={authMode} 
                onClose={() => setShowAuth(false)} 
                onSuccess={() => setShowAuth(false)} 
              />
            </div>
          ) : null}
          {showCloudLibrary ? (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
              <CloudLibraryModal 
                onClose={() => setShowCloudLibrary(false)}
                onDownload={downloadFromCloud}
                onSyncPublic={syncOfflineContentToSupabase}
                isSyncing={syncingPublic}
                materials={publicMaterials}
                isAdmin={user?.email === 'wgmasvix@gmail.com'}
              />
            </div>
          ) : null}
          {activeTab === 'library' ? (
            <LibraryView 
              items={library} 
              drafts={drafts}
              activeTab={libraryTab}
              onTabChange={setLibraryTab}
              onOpen={openFromLibrary} 
              onDelete={deleteFromLibrary} 
              onOpenDraft={loadDraft}
              onDeleteDraft={deleteDraft}
              onClose={() => setActiveTab('learn')} 
              onExport={handleExportLibrary}
              onSync={syncLibraryWithSupabase}
              syncing={isSyncing}
              lastSync={lastSyncTime}
              isOnline={isOnline}
              onOpenCloud={() => setShowCloudLibrary(true)}
            />
          ) : activeTab === 'settings' ? (
            <SettingsView 
              user={user}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              onLogout={handleLogout}
              onLogin={() => {
                setAuthMode('login');
                setShowAuth(true);
              }}
              onResetSession={resetSession}
            />
          ) : step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12 py-4"
            >
              <div className="relative rounded-[3rem] overflow-hidden aspect-[4/5] sm:aspect-[21/9] max-w-5xl mx-auto shadow-2xl group border border-slate-200 dark:border-slate-800">
                <div className="absolute inset-0 z-0">
                  <img 
                    src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&q=80&w=1200&h=800"
                    alt="Hero"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
                </div>
                
                <div className="relative z-10 h-full flex flex-col justify-end p-8 sm:p-16">
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-3xl"
                  >
                    <div className="flex flex-wrap items-center gap-3 mb-8">
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="px-4 py-1.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em]"
                      >
                        {getGreeting()}
                      </motion.div>
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="px-4 py-1.5 bg-emerald-500 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20"
                      >
                        ZIMSEC 2026
                      </motion.div>
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="px-4 py-1.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em]"
                      >
                        Heritage-Based
                      </motion.div>
                    </div>
                    
                    <h2 className="text-5xl sm:text-8xl font-black text-white leading-[0.85] tracking-tighter uppercase font-display mb-8">
                      {user ? `Hello, ${user.email?.split('@')[0]}` : 'Master'} <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Your Future</span>
                    </h2>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                      <p className="text-slate-300 text-sm sm:text-lg font-medium max-w-md leading-relaxed border-l-2 border-emerald-500/50 pl-6">
                        The ultimate study companion for Zimbabwean students. Generate practice papers, quizzes, and textbook chapters tailored to your level.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const element = document.getElementById('subject-selection');
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-20 h-20 rounded-full bg-white text-slate-950 flex items-center justify-center group/btn shadow-2xl transition-all hover:bg-emerald-400 hover:text-white"
                      >
                        <ChevronRight className="w-8 h-8 transition-transform group-hover/btn:translate-x-1" />
                      </motion.button>
                    </div>
                  </motion.div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-12 right-12 hidden lg:block">
                  <div className="w-32 h-32 border border-white/10 rounded-full flex items-center justify-center animate-spin-slow">
                    <div className="w-24 h-24 border border-white/20 rounded-full flex items-center justify-center">
                      <div className="w-16 h-16 border border-white/30 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Prominent Download Offline Card */}
              <div className="max-w-5xl mx-auto">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[3rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Cloud className="w-64 h-64" />
                  </div>
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl text-center sm:text-left">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                        <Shield className="w-4 h-4" />
                        Offline Access Ready
                      </div>
                      <h3 className="text-3xl sm:text-5xl font-black mb-4 font-display uppercase leading-none tracking-tight">
                        Study Anywhere, <br />
                        <span className="text-emerald-300">No Data Needed</span>
                      </h3>
                      <p className="text-emerald-50/80 font-medium text-sm sm:text-base mb-8">
                        Download all core syllabus guides, textbooks, and practice papers to your device. Perfect for studying in areas with limited connectivity.
                      </p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                        <Button
                          variant="secondary"
                          size="lg"
                          onClick={syncLibraryWithSupabase}
                          loading={isSyncing}
                          className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl"
                          leftIcon={isSyncing ? null : <CloudDownload className="w-5 h-5" />}
                        >
                          {isSyncing ? "Syncing..." : "Sync Cloud Library"}
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setShowCloudLibrary(true)}
                          className="border-white/30 text-white hover:bg-white/10 px-8 h-14 rounded-2xl text-sm font-black uppercase tracking-widest backdrop-blur-sm"
                          leftIcon={<Cloud className="w-5 h-5" />}
                        >
                          Cloud Library
                        </Button>
                      </div>
                    </div>
                    <div className="hidden lg:block w-72 h-72 bg-white/10 backdrop-blur-2xl rounded-[3rem] border border-white/20 p-8 shadow-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div className="h-2 w-32 bg-white/20 rounded-full" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 w-full bg-white/10 rounded-full" />
                          <div className="h-2 w-full bg-white/10 rounded-full" />
                          <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                        </div>
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                          <div className="h-2 w-16 bg-white/20 rounded-full" />
                          <div className="w-6 h-6 bg-white/20 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {library.length > 0 && (
                <div className="space-y-6 max-w-5xl mx-auto">
                  <div className="flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                      <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.3em] font-display">Continue Learning</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setLibraryTab('saved');
                        setActiveTab('library');
                      }}
                      className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    >
                      View All
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                    {library.slice(0, 3).map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        onClick={() => openFromLibrary(item)}
                        className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-emerald-500/50 transition-all cursor-pointer group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-125">
                          {SUBJECTS.find(s => s.id === item.subject)?.icon}
                        </div>
                        <div className="flex items-center gap-5 mb-6">
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:rotate-6", SUBJECTS.find(s => s.id === item.subject)?.color)}>
                            {SUBJECTS.find(s => s.id === item.subject)?.icon && React.cloneElement(SUBJECTS.find(s => s.id === item.subject)!.icon as React.ReactElement<any>, { className: "w-7 h-7" })}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h4 className="font-black text-slate-900 dark:text-slate-100 text-base truncate font-display uppercase tracking-tight">{item.subject}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[8px] font-black text-slate-500 uppercase tracking-widest">{item.contentType}</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">• {item.grade}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last opened {new Date(item.timestamp).toLocaleDateString()}</span>
                          <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Heritage Hub Promo Card */}
              <div className="max-w-5xl mx-auto px-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[3rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <GraduationCap className="w-64 h-64" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl text-center md:text-left">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                        <Star className="w-4 h-4 fill-current" />
                        Heritage-Based Curriculum
                      </div>
                      <h3 className="text-3xl sm:text-5xl font-black mb-4 font-display uppercase leading-none tracking-tight">
                        Heritage Hub <br />
                        <span className="text-amber-200">Cultural Learning</span>
                      </h3>
                      <p className="text-amber-50/80 font-medium text-sm sm:text-base mb-8">
                        Explore our new Heritage-Based Curriculum resources. From Family & Heritage Studies to indigenous languages, we've got you covered.
                      </p>
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => {
                          setLevel("Junior");
                          setSubject("Heritage – Social Studies");
                          setStep(3);
                        }}
                        className="bg-white text-amber-700 hover:bg-amber-50 px-8 h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl"
                        leftIcon={<GraduationCap className="w-5 h-5" />}
                      >
                        Explore Heritage Hub
                      </Button>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-32 h-48 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 p-4 flex flex-col justify-between -rotate-6 group-hover:-rotate-12 transition-transform duration-500">
                        <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-amber-900">
                          <Users className="w-6 h-6" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-tight">Family Studies</div>
                      </div>
                      <div className="w-32 h-48 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 p-4 flex flex-col justify-between rotate-6 group-hover:rotate-12 transition-transform duration-500 mt-8">
                        <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center text-orange-900">
                          <Globe className="w-6 h-6" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-tight">Social Studies</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                    <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.3em] font-display">Offline Guides</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setLibraryTab('guides');
                      setActiveTab('library');
                    }}
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    View All
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                  {OFFLINE_GUIDES.slice(0, 3).map((guide, i) => (
                    <motion.div
                      key={guide.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      onClick={() => openFromLibrary({
                        id: guide.id,
                        subject: guide.subject as Subject,
                        level: 'O-Level',
                        grade: 'Form 4',
                        contentType: 'Notes',
                        topic: guide.topic,
                        content: guide.content,
                        generatedImage: null,
                        timestamp: Date.now()
                      })}
                      className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-blue-500/50 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm transition-transform group-hover:rotate-6">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm truncate uppercase font-display tracking-tight">{guide.title}</h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{guide.subject}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">{guide.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Read Guide</span>
                        <ArrowRight className="w-4 h-4 text-blue-500 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                    <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.3em] font-display">Quick Revision</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setLibraryTab('flashcards');
                      setActiveTab('library');
                    }}
                    className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    View All
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                  {OFFLINE_FLASHCARDS.slice(0, 3).map((fc, i) => (
                    <motion.div
                      key={fc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      onClick={() => openFromLibrary({
                        id: fc.id,
                        subject: fc.subject as Subject,
                        level: 'O-Level',
                        grade: 'Form 4',
                        contentType: 'Flashcards',
                        topic: fc.topic,
                        content: fc.cards,
                        generatedImage: null,
                        timestamp: Date.now()
                      })}
                      className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-amber-500/50 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm transition-transform group-hover:rotate-6">
                          <Layers className="w-6 h-6" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm truncate uppercase font-display tracking-tight">{fc.topic}</h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{fc.subject}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-[9px] font-black text-amber-600 uppercase tracking-widest">
                          {fc.cards.length} Cards
                        </div>
                        <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          Active Recall
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Start Session</span>
                        <Zap className="w-4 h-4 text-amber-500 transform group-hover:scale-125 transition-transform" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="max-w-5xl mx-auto bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[3rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl shadow-emerald-500/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <Compass className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-emerald-100">Heritage Hub</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black font-display uppercase leading-none tracking-tighter">
                      Explore Zimbabwe's <br />
                      <span className="text-emerald-200">Rich Heritage</span>
                    </h2>
                    <p className="text-emerald-50/80 text-sm sm:text-base font-medium max-w-md">
                      Learn about our history, culture, and national values through curated offline resources.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button 
                        onClick={() => {
                          setLibraryTab('guides');
                          setActiveTab('library');
                        }}
                        className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-4 h-auto rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl"
                      >
                        Explore Guides
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setLibraryTab('flashcards');
                          setActiveTab('library');
                        }}
                        className="border-white/30 text-white hover:bg-white/10 px-8 py-4 h-auto rounded-2xl font-black uppercase tracking-widest text-xs"
                      >
                        Quick Facts
                      </Button>
                    </div>
                  </div>
                    <div className="w-full md:w-1/3 grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-center space-y-2">
                      <div className="text-2xl font-black font-display">{OFFLINE_GUIDES.length}</div>
                      <div className="text-[8px] font-black uppercase tracking-widest text-emerald-200">Guides</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-center space-y-2">
                      <div className="text-2xl font-black font-display">{OFFLINE_FLASHCARDS.reduce((acc, set) => acc + set.cards.length, 0)}</div>
                      <div className="text-[8px] font-black uppercase tracking-widest text-emerald-200">Cards</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-center space-y-2 col-span-2">
                      <div className="text-sm font-black uppercase tracking-widest text-emerald-200">100% Offline</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8 max-w-5xl mx-auto">
                <div className="text-center space-y-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Select Your Level</h3>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tighter uppercase font-display">Where are you studying?</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                  {[
                    { id: "Infant", icon: <Trees className="w-8 h-8" />, color: "bg-emerald-500", desc: "ECD A - Grade 2" },
                    { id: "Junior", icon: <Sprout className="w-8 h-8" />, color: "bg-green-500", desc: "Grade 3 - Grade 6" },
                    { id: "Grade 7", icon: <GraduationCap className="w-8 h-8" />, color: "bg-indigo-500", desc: "Final Primary Year" },
                    { id: "O-Level", icon: <BookOpen className="w-8 h-8" />, color: "bg-blue-500", desc: "Form 1 - Form 4" },
                    { id: "A-Level", icon: <BrainCircuit className="w-8 h-8" />, color: "bg-purple-500", desc: "Form 5 - Form 6" }
                  ].map((l, i) => (
                    <motion.button
                      key={l.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      whileHover={{ y: -12, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setLevel(l.id as Level);
                        setGrade(GRADES_BY_LEVEL[l.id as Level][0]);
                        setStep(2);
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] flex flex-col items-center gap-6 hover:border-emerald-500 transition-all shadow-2xl shadow-slate-200/50 dark:shadow-none group relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-xl transition-all group-hover:rotate-12 group-hover:scale-110", l.color)}>
                        {l.icon}
                      </div>
                      <div className="text-center">
                        <span className="text-xl font-black text-slate-900 dark:text-slate-100 font-display uppercase tracking-tight">{l.id}</span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{l.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="pt-12 max-w-5xl mx-auto">
                <QuoteSection />
              </div>
            </motion.div>
          ) : step === 2 ? (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight font-display">{level} Subjects</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Choose a subject to explore topics and start learning.</p>
                </div>
                
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start relative">
                  {GRADES_BY_LEVEL[level].map((g, idx) => (
                    <button
                      key={`${g}-${idx}`}
                      onClick={() => {
                        setGrade(g);
                        setSuggestedTopics([]);
                      }}
                      className={cn(
                        "relative px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors z-10",
                        grade === g
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      )}
                    >
                      {g}
                      {grade === g && (
                        <motion.div
                          layoutId="grade-nav-active"
                          className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-sm -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative max-w-md w-full">
                <Input 
                  placeholder={`Search ${level} subjects...`}
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                  className="shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-[120px]">
                {SUBJECTS.filter(s => {
                  const indigenousLanguages: Subject[] = ["Shona", "Ndebele", "Xangani", "Tshvenda", "Sotho", "Kalanga", "Tswana", "Xhosa", "Barwe", "Chewa", "Nambya", "Tonga", "Ndau", "Khoisan"];
                  
                  let isLevelMatch = false;
                  if (level === "Infant") {
                    const infantSubjects: Subject[] = ["Visual and Performing Arts", "Physical Education", "Mass Displays", "Mathematics and Science", "Family and Heritage Studies", "Information and Communication Technology", "English Language", ...indigenousLanguages];
                    isLevelMatch = infantSubjects.includes(s.id);
                  } else if (level === "Junior") {
                    const juniorSubjects: Subject[] = ["Visual and Performing Arts", "Physical Education", "Mass Displays", "Mathematics", "Science and Technology", "Agriculture", "English Language", "Information and Communication Technology", "Heritage – Social Studies", "Foreign Languages", "Life Skills Orientation Programme", ...indigenousLanguages];
                    isLevelMatch = juniorSubjects.includes(s.id);
                  } else if (level === "Grade 7") {
                    const grade7Subjects: Subject[] = ["Grade 7 Mathematics", "English Language", "Heritage-Based Curriculum", "History", "Indigenous Languages", "Agriculture", "Physical Education", "Arts"];
                    isLevelMatch = grade7Subjects.includes(s.id);
                  } else if (level === "O-Level") {
                    const oLevelExcluded: Subject[] = ["Grade 7 Mathematics", "Visual and Performing Arts", "Mass Displays", "Mathematics and Science", "Family and Heritage Studies", "Science and Technology", "Family, Religion and Moral Education", "Heritage – Social Studies"];
                    isLevelMatch = !oLevelExcluded.includes(s.id);
                  } else if (level === "A-Level") {
                    const aLevelSubjects: Subject[] = ["Film", "Crop Science", "Agricultural Engineering", "Technical Graphics", "Sport Management", "Family and Religious Education", "Dance", "Textile and Design Technology", "Food Technology & Design", "Sports Science and Technology", "Statistics", "Software Engineering", "Physics", "Chemistry", "Biology", "Guidance and Counselling", "Literature in English", "Pure Mathematics", "Arts", "Metal Technology", "Indigenous Languages", ...indigenousLanguages, "Animal Science", "Home Management and Design", "Communication Skills", "Music", "Sociology", "Economic History", "Economics", "Business Studies", "Wood Technology & Design", "Mechanical Mathematics", "Theatre", "Accounting", "Physical Education", "Computer Science", "Design and Technology", "Building Technology", "Foreign Languages", "Literature in Indigenous Languages", "Horticulture", "Business Enterprise", "Additional Mathematics", "History", "Geography", "Heritage Studies", "Life Skills Orientation Programme"];
                    isLevelMatch = aLevelSubjects.includes(s.id);
                  }

                  const isSearchMatch = s.id.toLowerCase().includes(subjectSearch.toLowerCase());
                  return isLevelMatch && isSearchMatch;
                }).map((s, i) => (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSubject(s.id);
                      setSuggestedTopics([]);
                      setStep(3);
                    }}
                    className={cn(
                      "group relative p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all text-left flex flex-col justify-between bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-500/10",
                      s.span || "col-span-1 row-span-1"
                    )}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-150 group-hover:-rotate-12">
                      {React.cloneElement(s.icon as React.ReactElement<any>, { className: "w-24 h-24" })}
                    </div>
                    
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all group-hover:rotate-6 group-hover:scale-110", s.color)}>
                      {React.cloneElement(s.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
                    </div>

                    <div className="relative z-10">
                      <h3 className="font-black text-slate-900 dark:text-slate-100 text-base font-display uppercase tracking-tight leading-tight">{s.id}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explore Topics</span>
                        <ChevronRight className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
              <QuoteSection />
            </motion.div>
          ) : step === 3 ? (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", SUBJECTS.find(s => s.id === subject)?.color)}>
                  {SUBJECTS.find(s => s.id === subject)?.icon && React.cloneElement(SUBJECTS.find(s => s.id === subject)!.icon as React.ReactElement<any>, { className: "w-7 h-7" })}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 font-display">{subject}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{grade} ({level}) Preparation</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-700 dark:text-slate-400 uppercase text-[10px] tracking-widest">Select Content Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {CONTENT_TYPES.map((ct, i) => (
                    <motion.button
                      key={ct.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setContentType(ct.id)}
                      className={cn(
                        "relative group p-5 rounded-[2rem] border-2 text-left transition-all flex flex-col gap-4 overflow-hidden",
                        contentType === ct.id 
                          ? "bg-white dark:bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10" 
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-200"
                      )}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6",
                          ct.color
                        )}>
                          {ct.icon}
                        </div>
                        <div className="flex items-center gap-2">
                          {ct.premium && !user && (
                            <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                              <Lock className="w-3 h-3" />
                              Premium
                            </div>
                          )}
                          {contentType === ct.id && (
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className={cn(
                          "text-lg font-black font-display uppercase tracking-tight transition-colors",
                          contentType === ct.id ? "text-emerald-900 dark:text-emerald-100" : "text-slate-900 dark:text-slate-100"
                        )}>{ct.label}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">{ct.description}</p>
                      </div>

                      {contentType === ct.id && (
                        <motion.div
                          layoutId="content-type-glow"
                          className="absolute inset-0 bg-emerald-500/5 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {contentType !== "Syllabus Guide" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-700 dark:text-slate-400 uppercase text-[10px] tracking-widest">Topic (Optional)</h3>
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={handleSuggestTopics}
                      disabled={loadingTopics}
                      className="text-[10px] font-bold text-emerald-600 h-auto py-1 px-2"
                      leftIcon={loadingTopics ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                    >
                      Suggest Topics
                    </Button>
                  </div>
                  <Input 
                    placeholder="e.g. Algebra, Photosynthesis, First World War..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                  {suggestedTopics.length > 0 && (
                    <div className="space-y-2 mt-2">
                      <Input 
                        placeholder="Filter suggested topics..."
                        value={topicSearch}
                        onChange={(e) => setTopicSearch(e.target.value)}
                        className="py-1.5 text-[10px]"
                        leftIcon={<Search className="w-3 h-3 text-slate-400" />}
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedTopics.filter(t => t.toLowerCase().includes(topicSearch.toLowerCase())).map((t, i) => (
                          <Button
                            key={`${t}-${i}`}
                            variant={topic === t ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setTopic(t)}
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-medium transition-all h-auto",
                              topic === t 
                                ? "bg-emerald-600 text-white" 
                                : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                            )}
                          >
                            {t}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(contentType === "Quiz" || contentType === "Practice Paper" || contentType === "Exam Paper") && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-700 dark:text-slate-400 uppercase text-[10px] tracking-widest">Select Difficulty</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={cn(
                          "py-3 px-4 rounded-2xl border-2 font-bold text-sm transition-all",
                          difficulty === d
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100 dark:shadow-none"
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-200"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-700 dark:text-slate-400 uppercase text-[10px] tracking-widest">Upload Work or Notes (Optional)</h3>
                  {image && (
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => setImage(null)}
                      className="text-[10px] font-bold text-red-500 h-auto py-1 px-2"
                      leftIcon={<X className="w-2.5 h-2.5" />}
                    >
                      Clear Image
                    </Button>
                  )}
                </div>
                
                {!image ? (
                  <Card 
                    variant="outline"
                    padding="md"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-dashed flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 transition-colors">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Snap or Upload a Photo</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Handwritten notes, essays, or diagrams for analysis</p>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </Card>
                ) : (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20">
                    <img 
                      src={image} 
                      alt="Uploaded work" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button 
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                      >
                        Change Photo
                      </Button>
                    </div>
                  </div>
                )}
              </div>

                  {contentType === "Feedback" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-700 dark:text-slate-400 uppercase text-[10px] tracking-widest">Paste your essay/answer</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveDraft(studentInput, "Essay")}
                          disabled={!studentInput.trim()}
                          className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700"
                          leftIcon={<PenTool className="w-3 h-3" />}
                        >
                          Save as Draft
                        </Button>
                      </div>
                      <textarea 
                        placeholder="Paste your text here for feedback..."
                        value={studentInput}
                        onChange={(e) => setStudentInput(e.target.value)}
                        className="w-full h-40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none shadow-sm"
                      />
                    </div>
                  )}

              {/* Textbook Verification Section */}
              {isConfigured && (
                <div className="space-y-4 p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm font-display uppercase tracking-tight">Textbook Verification</h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Verify content against official textbooks</p>
                      </div>
                    </div>
                    {textbooks.length > 0 && (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={verifyWithTextbook}
                          onChange={(e) => setVerifyWithTextbook(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                      </label>
                    )}
                  </div>

                  {textbooks.length === 0 ? (
                    <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        No textbooks found in Supabase storage. <br />
                        Upload .txt files to the <code className="bg-slate-100 dark:bg-slate-800 px-1 px-1 rounded">textbooks</code> bucket to enable verification.
                      </p>
                    </div>
                  ) : verifyWithTextbook && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 pt-2"
                    >
                      <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Select Reference Source</p>
                      <div className="grid grid-cols-1 gap-2">
                        {textbooks.map((book) => (
                          <button
                            key={book.name}
                            onClick={() => setSelectedTextbook(book.name)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left",
                              selectedTextbook === book.name
                                ? "bg-white dark:bg-slate-800 border-emerald-500 shadow-sm"
                                : "bg-white/50 dark:bg-slate-900/50 border-transparent hover:border-emerald-200"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <BookOpen className={cn("w-4 h-4", selectedTextbook === book.name ? "text-emerald-600" : "text-slate-400")} />
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{book.name}</span>
                            </div>
                            {selectedTextbook === book.name && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {generationError && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl mb-4"
                >
                  <div className="flex items-center gap-3 text-red-700 dark:text-red-400 mb-1">
                    <AlertCircle className="w-5 h-5" />
                    <h3 className="font-bold text-sm">Generation Failed</h3>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed mb-4">{generationError}</p>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleGenerate}
                      disabled={!isOnline}
                      className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Try Again
                    </button>
                    <button 
                      onClick={async () => {
                        const ok = await testConnection();
                        if (ok) {
                          alert("Connection successful! The API is responding.");
                        } else {
                          alert("Connection failed. Please check your internet and DEEPSEEK_API_KEY.");
                        }
                      }}
                      className="px-6 py-2 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm"
                    >
                      Check Connection
                    </button>
                  </div>
                </motion.div>
              )}

              {!isOnline && (
                <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border-2 border-dashed border-amber-200 dark:border-amber-800 rounded-[2rem] mb-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 mx-auto">
                    <CloudOff className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">AI Generation Offline</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                      You are currently offline. New content generation requires an internet connection.
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => { setActiveTab('library'); setStep(1); }}
                    className="w-full border-amber-200 text-amber-600 hover:bg-amber-50"
                    leftIcon={<History className="w-4 h-4" />}
                  >
                    Browse Offline Library
                  </Button>
                </div>
              )}

              <Button
                disabled={!contentType || loading || (verifyWithTextbook && !selectedTextbook) || !isOnline}
                onClick={handleGenerate}
                loading={loading}
                className="w-full py-3.5 text-base"
                leftIcon={!loading && (isOnline ? <Sparkles className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />)}
              >
                {isOnline ? "Generate Content" : "Offline Mode"}
              </Button>
            </motion.div>
          ) : step === 4 && result ? (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 pb-20"
            >
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(3)}
                    className="p-2 h-auto rounded-full text-slate-400"
                    leftIcon={<ArrowLeft className="w-6 h-6" />}
                  />
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{contentType}</h2>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{subject} • {level}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button 
                    variant={isReaderMode ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setIsReaderMode(!isReaderMode)}
                    className="px-3"
                    leftIcon={isReaderMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  >
                    <span className="hidden sm:inline">Reader</span>
                  </Button>
                  {!isReaderMode && (
                    <div className="relative hidden md:block">
                      <Input 
                        placeholder="Find..."
                        value={contentSearch}
                        onChange={(e) => setContentSearch(e.target.value)}
                        className="py-1.5 text-xs w-32 focus:w-48"
                        leftIcon={<Search className="w-3.5 h-3.5" />}
                      />
                    </div>
                  )}
                  {!isReaderMode && (
                    <Button 
                      variant={showNotes ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setShowNotes(!showNotes)}
                      className="px-3"
                      leftIcon={<StickyNote className="w-4 h-4" />}
                    >
                      <span className="hidden sm:inline">Notes</span>
                    </Button>
                  )}
                  {!isReaderMode && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadResult}
                      className="px-3"
                      title="Download for Offline"
                      leftIcon={<Download className="w-4 h-4" />}
                    >
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  )}
                  {!isReaderMode && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleSaveToLibrary}
                      className="px-3 text-emerald-600"
                      leftIcon={!user ? <Lock className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    >
                      <span className="hidden sm:inline">{!user ? 'Premium' : 'Save'}</span>
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={reset}
                    className="px-3"
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                  >
                    <span className="hidden sm:inline">New</span>
                  </Button>
                </div>
              </div>

              <div className={cn("grid grid-cols-1 gap-6 items-start", !isReaderMode && "lg:grid-cols-12")}>
                <div className={cn("space-y-6 transition-all duration-500", !isReaderMode && showNotes ? "lg:col-span-7" : "lg:col-span-12")}>
                  {contentType === "Quiz" ? (
                    <QuizView 
                      questions={result} 
                      onComplete={() => setStep(1)} 
                    />
                  ) : contentType === "Flashcards" ? (
                    <FlashcardView 
                      cards={result} 
                      onComplete={() => setStep(1)} 
                    />
                  ) : (
                    <div className={cn(
                      "bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm prose prose-emerald dark:prose-invert max-w-none prose-headings:font-black prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-strong:text-emerald-700 dark:prose-strong:text-emerald-400 prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-50 dark:prose-blockquote:bg-emerald-900/10 prose-blockquote:py-1 prose-hr:border-emerald-100 dark:prose-hr:border-emerald-900/30",
                      isReaderMode && "font-serif text-lg max-w-3xl mx-auto shadow-2xl"
                    )}>
                      {verifiedBy && (
                        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                          <Shield className="w-3.5 h-3.5" />
                          Verified against: {verifiedBy}
                        </div>
                      )}
                      {generatedImage && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mb-6 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl shadow-emerald-100 dark:shadow-emerald-900/20"
                        >
                          <img 
                            src={generatedImage} 
                            alt={`Illustration for ${topic}`} 
                            className="w-full h-auto object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center">
                            <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">AI Generated Illustration: {topic}</p>
                          </div>
                        </motion.div>
                      )}
                      <Markdown>{result}</Markdown>
                      
                      {audioUrl && (
                        <Card 
                          variant="ghost" 
                          padding="sm"
                          className="mt-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-800 flex flex-col sm:flex-row items-center gap-4"
                        >
                          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Volume2 className="w-6 h-6" />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <h4 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">Audio Explanation</h4>
                            <p className="text-xs text-emerald-700 dark:text-emerald-400">Listen to the AI breakdown of this topic</p>
                          </div>
                          <audio controls src={audioUrl} className="w-full sm:w-auto h-8" />
                        </Card>
                      )}

                      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex gap-2">
                          {!audioUrl && (
                            <motion.div
                              animate={!user ? { scale: [1, 1.05, 1] } : {}}
                              transition={{ repeat: Infinity, duration: 2 }}
                            >
                              <Button 
                                variant="secondary"
                                size="sm"
                                loading={generatingAudio}
                                onClick={handleGenerateAudio}
                                className={cn(!user && "bg-gradient-to-r from-amber-500 to-orange-500 border-none text-white shadow-lg shadow-amber-200 dark:shadow-none")}
                                leftIcon={!generatingAudio && (!user ? <Lock className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />)}
                              >
                                {!user ? 'Unlock Audio' : 'Generate Audio'}
                              </Button>
                            </motion.div>
                          )}
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={reset}
                          >
                            New Session
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500 italic text-center sm:text-left">"Success is the sum of small efforts, repeated day in and day out."</p>
                      </div>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {!isReaderMode && showNotes && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 20, scale: 0.95 }}
                      className="lg:col-span-5 sticky top-24"
                    >
                      <div className="bg-[#FFF9C4] rounded-[2.5rem] p-8 border-2 border-yellow-200 shadow-xl shadow-yellow-100/50 flex flex-col min-h-[500px] max-h-[70vh]">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3 text-yellow-800">
                            <div className="w-10 h-10 bg-yellow-200 rounded-xl flex items-center justify-center">
                              <StickyNote className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-black uppercase text-xs tracking-widest leading-none">Revision Notes</h3>
                              <p className="text-[10px] font-bold text-yellow-700/60 mt-1">Auto-saving locally</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSaveDraft(userNotes, "Notes")}
                              disabled={!userNotes.trim()}
                              title="Save as Draft"
                              className="bg-white dark:bg-slate-800 rounded-xl text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors shadow-sm"
                            >
                              <PenTool className="w-5 h-5" />
                            </Button>
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={downloadNotes}
                              title="Download as .txt"
                              className="bg-white dark:bg-slate-800 rounded-xl text-yellow-700 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-900/50 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors shadow-sm"
                            >
                              <Download className="w-5 h-5" />
                            </Button>
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => setUserNotes("")}
                              title="Clear notes"
                              className="bg-white dark:bg-slate-800 rounded-xl text-red-500 border border-red-100 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors shadow-sm"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                        <textarea 
                          value={userNotes}
                          onChange={(e) => setUserNotes(e.target.value)}
                          placeholder="Type your notes here as you revise... 
                          
• Key definitions
• Formulas to remember
• Important dates"
                          className="flex-1 w-full bg-transparent resize-none outline-none text-yellow-900 placeholder:text-yellow-700/30 font-medium leading-relaxed text-lg"
                        />
                        <div className="mt-6 pt-6 border-t border-yellow-200/50 flex items-center justify-between text-[10px] font-black text-yellow-700/40 uppercase tracking-[0.2em]">
                          <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-yellow-400" />
                            <div className="w-1 h-1 rounded-full bg-yellow-400" />
                            <div className="w-1 h-1 rounded-full bg-yellow-400" />
                          </div>
                          <span>{userNotes.length} characters</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Footer */}
      <footer className="py-12 text-center text-slate-400 text-sm space-y-4">
        <p>© 2026 GREEN BOOK HBC ASSISTANT • Empowering Zimbabwean Students</p>
        <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 opacity-50">Powered by</p>
          <p className="font-signature text-3xl text-emerald-600 dark:text-emerald-400 -rotate-3">The Diplomat</p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <motion.a
        href="https://wa.me/263784457922"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#20ba5a] transition-colors group"
        title="Chat with us on WhatsApp"
      >
        <MessageSquare className="w-7 h-7" />
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Contact The Diplomat
        </span>
      </motion.a>
    </div>
  );
}

function QuizView({ questions, onComplete }: { questions: QuizQuestion[], onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  useEffect(() => {
    if (showResult) {
      const percentage = (score / questions.length) * 100;
      if (percentage >= 80) {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
      }
    }
  }, [showResult, score, questions.length]);

  const current = questions[index];

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === current.correctAnswer) {
      setScore(s => s + 1);
      // Celebration effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
    } else {
      setWrongAnswers(w => w + 1);
    }
  };

  const next = () => {
    if (index < questions.length - 1) {
      setIndex(i => i + 1);
      setSelected(null);
    } else {
      setShowResult(true);
    }
  };

  const getFeedback = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return { title: "Perfect Score!", message: "Excellent work! You have a complete mastery of this topic.", color: "text-emerald-600", icon: <CheckCircle2 className="w-12 h-12" /> };
    if (percentage >= 80) return { title: "Great Job!", message: "You have a very strong understanding. Keep it up!", color: "text-blue-600", icon: <Sparkles className="w-12 h-12" /> };
    if (percentage >= 50) return { title: "Good Effort!", message: "You're on the right track. A bit more revision will make you an expert.", color: "text-amber-600", icon: <BrainCircuit className="w-12 h-12" /> };
    return { title: "Keep Practicing!", message: "Don't be discouraged. Review the explanations and try again to improve.", color: "text-red-600", icon: <RefreshCw className="w-12 h-12" /> };
  };

  if (showResult) {
    const feedback = getFeedback();
    return (
      <Card padding="lg" className="text-center space-y-8 shadow-xl">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn("w-24 h-24 rounded-full flex items-center justify-center mx-auto bg-opacity-10", feedback.color.replace('text', 'bg'))}
        >
          <div className={feedback.color}>{feedback.icon}</div>
        </motion.div>
        
        <div className="space-y-2">
          <h2 className={cn("text-3xl font-black uppercase tracking-tight", feedback.color)}>{feedback.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">{feedback.message}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{score}/{questions.length}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
            <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">Correct</p>
            <p className="text-2xl font-black text-emerald-600">{score}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20">
            <p className="text-[10px] font-black text-red-600/60 uppercase tracking-widest mb-1">Incorrect</p>
            <p className="text-2xl font-black text-red-600">{wrongAnswers}</p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="secondary"
            onClick={() => {
              setIndex(0);
              setScore(0);
              setWrongAnswers(0);
              setShowResult(false);
              setSelected(null);
            }}
            className="px-8 py-4 h-auto"
            leftIcon={<RefreshCw className="w-5 h-5" />}
          >
            Retake Quiz
          </Button>
          <Button 
            onClick={onComplete}
            className="px-8 py-4 h-auto"
          >
            Back to Home
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Question {index + 1} of {questions.length}</span>
        <div className="h-2 w-32 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500" 
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <Card padding="md" className="space-y-8">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{current.question}</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {current.options.map((opt, i) => (
            <Button
              key={`${opt}-${i}`}
              variant="outline"
              onClick={() => handleAnswer(i)}
              className={cn(
                "h-auto p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                selected === null 
                  ? "border-slate-100 dark:border-slate-800 hover:border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/10" 
                  : i === current.correctAnswer 
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" 
                    : selected === i 
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300" 
                      : "border-slate-50 dark:border-slate-900 opacity-50"
              )}
            >
              <span className="font-medium">{opt}</span>
              {selected !== null && i === current.correctAnswer && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {selected === i && i !== current.correctAnswer && <XCircle className="w-5 h-5 text-red-500" />}
            </Button>
          ))}
        </div>

        {selected !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl border-2 mb-4",
              selected === current.correctAnswer 
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-700 dark:text-emerald-400" 
                : "bg-red-50 dark:bg-red-900/20 border-red-200 text-red-700 dark:text-red-400"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg",
              selected === current.correctAnswer ? "bg-emerald-500" : "bg-red-500"
            )}>
              {selected === current.correctAnswer ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest">{selected === current.correctAnswer ? 'Correct!' : 'Incorrect'}</p>
              <p className="text-sm font-bold">{selected === current.correctAnswer ? 'Well done, you got it right.' : 'Not quite, but keep learning!'}</p>
            </div>
          </motion.div>
        )}

        {selected !== null && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700"
          >
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-2 uppercase tracking-wider">Explanation</h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{current.explanation}</p>
            <Button 
              onClick={next}
              className="mt-6 w-full py-3 h-auto"
            >
              {index === questions.length - 1 ? "Finish Quiz" : "Next Question"}
            </Button>
          </motion.div>
        )}
      </Card>
    </div>
  );
}

function FlashcardView({ cards, onComplete }: { cards: Flashcard[], onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isListView, setIsListView] = useState(false);

  const filteredCards = cards.filter(c => 
    c.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const next = () => {
    if (index < filteredCards.length - 1) {
      setIndex(i => i + 1);
      setIsFlipped(false);
    } else {
      onComplete();
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(i => i - 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {isListView ? `${filteredCards.length} Cards Found` : `Card ${index + 1} of ${filteredCards.length}`}
          </span>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl relative">
            {[
              { id: 'deck', label: 'Deck', active: !isListView },
              { id: 'list', label: 'List', active: isListView }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setIsListView(tab.id === 'list')}
                className={cn(
                  "relative px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-colors z-10",
                  tab.active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                {tab.label}
                {tab.active && (
                  <motion.div
                    layoutId="flashcard-view-active"
                    className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-sm -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Input 
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIndex(0);
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {isListView ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredCards.map((card, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={`${card.question}-${i}`}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-all group"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 text-[10px] font-bold">
                  {i + 1}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Flashcard</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">{card.question}</h4>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium">{card.answer}</p>
              </div>
            </motion.div>
          ))}
          {filteredCards.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400">No flashcards match your search.</p>
            </div>
          )}
        </div>
      ) : filteredCards.length > 0 ? (
        <div className="perspective-1000 h-80 w-full relative">
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            className="w-full h-full relative preserve-3d cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center justify-center p-8 text-center">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">Question</span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">{filteredCards[index].question}</h3>
              <p className="mt-8 text-slate-400 text-sm animate-pulse">Click to reveal answer</p>
            </div>

            {/* Back */}
            <div 
              className="absolute inset-0 backface-hidden bg-emerald-600 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center text-white"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest mb-4">Answer</span>
              <p className="text-lg sm:text-xl font-medium leading-relaxed">{filteredCards[index].answer}</p>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-400">No flashcards match your search.</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        {!isListView && filteredCards.length > 0 && (
          <>
            <Button 
              variant="outline"
              onClick={prev}
              disabled={index === 0}
              className="p-4 h-auto rounded-2xl"
              leftIcon={<ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />}
            />
            <Button 
              onClick={next}
              className="flex-1 py-4 h-auto"
            >
              {index === filteredCards.length - 1 ? "Finish Revision" : "Next Card"}
            </Button>
          </>
        )}
        {(isListView || filteredCards.length === 0) && (
          <Button 
            onClick={onComplete}
            className="px-8 py-4 h-auto"
          >
            End Session
          </Button>
        )}
      </div>
    </div>
  );
}

const OFFLINE_GUIDES = [
  {
    id: 'guide-1',
    title: 'ZIMSEC Exam Strategy',
    subject: 'General',
    topic: 'Exam Techniques',
    contentType: 'Guide',
    description: 'Essential tips for tackling ZIMSEC O & A Level exams effectively.',
    content: `
# ZIMSEC Exam Strategy Guide

## 1. Time Management
- Allocate time per mark (e.g., 1.5 minutes for a 1-mark question).
- Don't get stuck on difficult questions; move on and come back later.

## 2. Understanding Command Words
- **Define**: Give a clear, concise meaning.
- **Explain**: Provide reasons and details.
- **Discuss**: Present multiple viewpoints or pros and cons.
- **Calculate**: Show all working steps for partial marks.

## 3. Presentation
- Use clear headings and bullet points where appropriate.
- Ensure your handwriting is legible.
- Draw diagrams with a pencil and label them clearly.

## 4. Revision Techniques
- Practice with past papers under timed conditions.
- Use active recall and spaced repetition for formulas and definitions.
    `,
  },
  {
    id: 'guide-2',
    title: 'Effective Study Habits',
    subject: 'General',
    topic: 'Learning Science',
    contentType: 'Guide',
    description: 'How to maximize your learning efficiency and retention.',
    content: `
# Effective Study Habits

## 1. The Pomodoro Technique
- Study for 25 minutes, then take a 5-minute break.
- After 4 sessions, take a longer break (15-30 mins).

## 2. Active Recall
- Instead of re-reading, test yourself on the material.
- Use flashcards or summary sheets without looking at your notes.

## 3. Spaced Repetition
- Review material at increasing intervals (1 day, 3 days, 1 week, 1 month).

## 4. Mind Mapping
- Visualize connections between topics to improve understanding of complex subjects.
    `,
  },
  {
    id: 'guide-3',
    title: 'Mathematics: Core Formulas',
    subject: 'Mathematics',
    topic: 'Formula Sheet',
    contentType: 'Guide',
    description: 'Quick reference for essential O-Level Mathematics formulas.',
    content: `
# O-Level Mathematics: Core Formulas

## Algebra
- Quadratic Formula: x = [-b ± √(b² - 4ac)] / 2a
- Difference of Two Squares: a² - b² = (a - b)(a + b)

## Geometry
- Area of a Circle: πr²
- Circumference of a Circle: 2πr
- Volume of a Cylinder: πr²h
- Surface Area of a Sphere: 4πr²

## Trigonometry
- SOH CAH TOA
- Sine Rule: a/sinA = b/sinB = c/sinC
- Cosine Rule: a² = b² + c² - 2bc cosA
    `,
  },
  {
    id: 'guide-4',
    title: 'English: Grammar & Composition',
    subject: 'English Language',
    topic: 'Writing Skills',
    contentType: 'Guide',
    description: 'Master the basics of English grammar and essay structure.',
    content: `
# English Language: Grammar & Composition

## 1. Essay Structure
- **Introduction**: Hook, background, and thesis statement.
- **Body Paragraphs**: Topic sentence, evidence, analysis, and transition.
- **Conclusion**: Restate thesis, summarize main points, and final thought.

## 2. Common Grammar Rules
- **Subject-Verb Agreement**: The subject and verb must match in number.
- **Punctuation**: Use commas for lists, semi-colons for related independent clauses.
- **Tense Consistency**: Stick to one tense unless there's a clear reason to change.

## 3. Vocabulary
- Use varied vocabulary but ensure you know the exact meaning of words before using them.
    `,
  },
  {
    id: 'guide-5',
    title: 'Biology: Key Concepts',
    subject: 'Biology',
    topic: 'Revision Summary',
    contentType: 'Guide',
    description: 'Quick summary of core biological processes for O-Level.',
    content: `
# Biology: Key Concepts Summary

## 1. Cell Structure
- **Animal Cells**: Nucleus, cytoplasm, cell membrane, mitochondria, ribosomes.
- **Plant Cells**: All of the above plus cell wall, chloroplasts, and large vacuole.

## 2. Photosynthesis
- Equation: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂
- Factors affecting rate: Light intensity, CO₂ concentration, temperature.

## 3. Human Circulatory System
- Heart structure: 4 chambers (atria and ventricles).
- Blood vessels: Arteries (away from heart), Veins (towards heart), Capillaries (exchange).
    `,
  },
  {
    id: 'guide-6',
    title: 'History: Zimbabwe Liberation War',
    subject: 'History',
    topic: 'Second Chimurenga',
    contentType: 'Guide',
    description: 'Key events and figures of the Second Chimurenga (1966-1979).',
    content: `
# History: The Second Chimurenga

## 1. Causes of the War
- Land dispossession by the colonial government.
- Lack of political representation for the majority.
- Discriminatory laws (e.g., Land Apportionment Act).

## 2. Key Figures
- **Joshua Nkomo**: Leader of ZAPU (Zimbabwe African People's Union).
- **Robert Mugabe**: Leader of ZANU (Zimbabwe African National Union).
- **Herbert Chitepo**: ZANU Chairman and architect of the guerrilla war.
- **Josiah Tongogara**: Commander of ZANLA forces.

## 3. Major Events
- **Battle of Chinhoyi (1966)**: The symbolic start of the armed struggle.
- **Lancaster House Agreement (1979)**: The peace settlement that led to independence.
- **Independence Day (April 18, 1980)**: Zimbabwe becomes a sovereign nation.
    `,
  },
  {
    id: 'guide-7',
    title: 'Geography: Physical Features of Zimbabwe',
    subject: 'Geography',
    topic: 'Physical Geography',
    contentType: 'Guide',
    description: 'Overview of Zimbabwe\'s relief, climate, and major rivers.',
    content: `
# Geography: Physical Features of Zimbabwe

## 1. Relief Regions
- **Highveld**: Central plateau (above 1200m), temperate climate.
- **Middleveld**: Slopes of the plateau (600m - 1200m).
- **Lowveld**: Low-lying areas (below 600m), hot and dry (e.g., Zambezi & Limpopo valleys).
- **Eastern Highlands**: Mountainous region (e.g., Nyangani, Vumba, Chimanimani).

## 2. Major Rivers
- **Zambezi**: Northern border, home to Victoria Falls and Kariba Dam.
- **Limpopo**: Southern border with South Africa.
- **Save**: Drains the south-eastern part of the country.

## 3. Climate
- Tropical climate with four seasons:
  - **Cool, dry season**: May to August.
  - **Hot, dry season**: September to October.
  - **Warm, wet season**: November to March.
  - **Post-rainy season**: April.
    `,
  },
  {
    id: 'guide-8',
    title: 'Combined Science: The Periodic Table',
    subject: 'Combined Science',
    topic: 'Chemistry Basics',
    contentType: 'Guide',
    description: 'Understanding the structure and trends of the periodic table.',
    content: `
# Combined Science: The Periodic Table

## 1. Structure
- **Groups**: Vertical columns (elements have same number of outer electrons).
- **Periods**: Horizontal rows (elements have same number of electron shells).

## 2. Key Groups
- **Group 1 (Alkali Metals)**: Highly reactive, react with water to form alkalis.
- **Group 7 (Halogens)**: Reactive non-metals, reactivity decreases down the group.
- **Group 0 (Noble Gases)**: Unreactive, full outer electron shells.

## 3. Trends
- **Atomic Radius**: Increases down a group, decreases across a period.
- **Metallic Character**: Decreases across a period, increases down a group.
    `,
  },
  {
    id: 'guide-9',
    title: 'Heritage Studies: National Symbols',
    subject: 'Heritage Studies',
    topic: 'National Identity',
    contentType: 'Guide',
    description: 'The meaning and significance of Zimbabwe\'s national symbols.',
    content: `
# Heritage Studies: National Symbols of Zimbabwe

## 1. The National Flag
- **Green**: Agriculture and fertility of the land.
- **Yellow**: Mineral wealth of the country.
- **Red**: Blood shed during the liberation struggle.
- **Black**: The native people of Zimbabwe.
- **White Triangle**: Peace and the way forward.
- **Zimbabwe Bird**: National emblem and identity.
- **Red Star**: Internationalism and the socialist aspirations (historically).

## 2. The National Anthem
- "Simudzai Mureza WeZimbabwe" (Raise the Flag of Zimbabwe).
- Composed by Professor Solomon Mutswairo.

## 3. The Coat of Arms
- Features the Zimbabwe Bird, two Kudus (unity), and the motto "Unity, Freedom, Work".
    `,
  },
  {
    id: 'guide-10',
    title: 'Commerce: Basic Accounting Principles',
    subject: 'Commerce',
    topic: 'Accounting',
    contentType: 'Guide',
    description: 'Introduction to double-entry bookkeeping and financial statements.',
    content: `
# Commerce: Basic Accounting Principles

## 1. The Accounting Equation
- **Assets = Liabilities + Equity**
- Assets: What the business owns (e.g., cash, stock, machinery).
- Liabilities: What the business owes (e.g., loans, creditors).
- Equity: The owner's investment in the business.

## 2. Double-Entry Bookkeeping
- Every transaction affects at least two accounts.
- **Debit (Dr)**: Left side of an account.
- **Credit (Cr)**: Right side of an account.
- Rule: For every debit, there must be a corresponding credit.

## 3. Financial Statements
- **Income Statement**: Shows profit or loss over a period.
- **Statement of Financial Position (Balance Sheet)**: Shows the financial position at a specific date.
    `,
  },
  {
    id: 'guide-11',
    title: 'History: The Unification of Zimbabwe',
    subject: 'History',
    topic: 'The Unification of Zimbabwe',
    contentType: 'Guide',
    description: 'Key events and figures leading to the formation of Zimbabwe.',
    content: `
# History: The Unification of Zimbabwe

## 1. The Pre-Colonial Period
- **Great Zimbabwe**: The center of a vast empire (11th-15th centuries).
- **Mutapa Empire**: Flourished in the north-east, known for trade.
- **Rozvi Empire**: Known for its military strength and resistance to Portuguese influence.

## 2. The Colonial Era
- **Pioneer Column (1890)**: The arrival of British settlers.
- **First Chimurenga (1896-1897)**: Resistance led by Mbuya Nehanda and Sekuru Kaguvi.
- **Rhodesia (1923-1979)**: The period of white minority rule.

## 3. The Path to Unification
- **Formation of Political Parties**: ZAPU (1961) and ZANU (1963).
- **Unity Accord (1987)**: The agreement between ZANU-PF and PF-ZAPU that unified the two major liberation movements.
- **Joshua Nkomo & Robert Mugabe**: The key leaders who signed the Accord to ensure national unity and peace.

## 4. Key Figures
- **Mbuya Nehanda**: A spiritual leader and symbol of resistance.
- **Joshua Nkomo**: Known as "Father Zimbabwe," leader of ZAPU.
- **Robert Mugabe**: Leader of ZANU and the first Prime Minister/President of independent Zimbabwe.
    `,
  },
  {
    id: 'guide-12',
    title: 'Agriculture: Soil Science',
    subject: 'Agriculture',
    topic: 'Soil Composition',
    contentType: 'Guide',
    description: 'Understanding soil types, fertility, and conservation in Zimbabwe.',
    content: `
# Agriculture: Soil Science

## 1. Soil Composition
- **Mineral Matter**: 45% (Sand, Silt, Clay).
- **Organic Matter**: 5% (Humus).
- **Air**: 25%.
- **Water**: 25%.

## 2. Soil Types in Zimbabwe
- **Sandy Soils**: Common in the Highveld, low fertility, good drainage.
- **Clay Soils**: Common in the Lowveld, high fertility, poor drainage.
- **Loam Soils**: Ideal for most crops, balanced properties.

## 3. Soil Conservation
- **Contour Ridges**: Prevent water erosion on slopes.
- **Crop Rotation**: Maintains soil fertility and breaks pest cycles.
- **Mulching**: Conserves moisture and adds organic matter.
    `,
  },
  {
    id: 'guide-13',
    title: 'Computer Science: Programming Basics',
    subject: 'Computer Science',
    topic: 'Intro to Algorithms',
    contentType: 'Guide',
    description: 'Fundamental concepts of programming and algorithmic thinking.',
    content: `
# Computer Science: Programming Basics

## 1. What is an Algorithm?
- A step-by-step procedure for solving a problem.
- Characteristics: Finiteness, Definiteness, Input, Output, Effectiveness.

## 2. Programming Constructs
- **Sequence**: Executing instructions one after another.
- **Selection (If-Else)**: Making decisions based on conditions.
- **Iteration (Loops)**: Repeating instructions multiple times.

## 3. Data Types
- **Integer**: Whole numbers (e.g., 10, -5).
- **Float/Real**: Numbers with decimals (e.g., 3.14).
- **String**: Text (e.g., "Hello World").
- **Boolean**: True or False.
    `,
  },
  {
    id: 'guide-14',
    title: 'Shona: Basic Grammar',
    subject: 'Shona',
    topic: 'Zvivizurwa (Nouns)',
    contentType: 'Guide',
    description: 'Introduction to Shona noun classes and basic sentence structure.',
    content: `
# Shona: Basic Grammar

## 1. Mapoka emazita (Noun Classes)
- Shona nouns are grouped into classes (e.g., Mupanda 1: Vanhu).
- **Mupanda 1/2**: Mu- / Va- (e.g., Munhu / Vanhu).
- **Mupanda 5/6**: Ri- / Ma- (e.g., Dombo / Matombo).

## 2. Zvivizurwa (Pronouns)
- **Ini**: I
- **Iwe**: You (singular)
- **Iye**: He/She
- **Isu**: We
- **Imi**: You (plural/respectful)
- **Ivo**: They

## 3. Kuvaka mitsara (Sentence Construction)
- Subject + Verb + Object (e.g., "Ini ndinoda kudya" - I like to eat).
    `,
  },
  {
    id: 'guide-15',
    title: 'Ndebele: Basic Grammar',
    subject: 'Ndebele',
    topic: 'Izibizo (Nouns)',
    contentType: 'Guide',
    description: 'Introduction to Ndebele noun classes and common phrases.',
    content: `
# Ndebele: Basic Grammar

## 1. Izigaba zezibizo (Noun Classes)
- **Isigaba 1/2**: Um- / Aba- (e.g., Umuntu / Abantu).
- **Isigaba 7/8**: Isi- / Izi- (e.g., Isitsha / Izitsha).

## 2. Izivumelwano (Concords)
- Nouns must agree with verbs and adjectives using prefixes.
- Example: "Umntwana uyadlala" (The child is playing).

## 3. Imikhonzo (Greetings)
- **Sawubona**: Hello (to one person).
- **Sanibonani**: Hello (to many people).
- **Unjani?**: How are you?
- **Ngiyaphila**: I am fine.
    `,
  },
  {
    id: 'guide-16',
    title: 'Physics: Mechanics & Motion',
    subject: 'Physics',
    topic: 'Forces and Motion',
    contentType: 'Guide',
    description: 'Core principles of motion, speed, velocity, and acceleration.',
    content: `
# Physics: Mechanics & Motion

## 1. Speed, Velocity, and Acceleration
- **Speed**: Distance / Time (Scalar).
- **Velocity**: Displacement / Time (Vector).
- **Acceleration**: Change in Velocity / Time.

## 2. Newton's Laws of Motion
- **First Law**: An object remains at rest or in uniform motion unless acted upon by a force.
- **Second Law**: Force = Mass × Acceleration (F = ma).
- **Third Law**: For every action, there is an equal and opposite reaction.

## 3. Work, Energy, and Power
- **Work**: Force × Distance.
- **Kinetic Energy**: ½mv².
- **Potential Energy**: mgh.
- **Power**: Work / Time.
    `,
  },
  {
    id: 'guide-17',
    title: 'Chemistry: Atomic Structure',
    subject: 'Chemistry',
    topic: 'Atoms and Isotopes',
    contentType: 'Guide',
    description: 'Understanding protons, neutrons, electrons, and isotopes.',
    content: `
# Chemistry: Atomic Structure

## 1. Subatomic Particles
- **Proton**: Positive charge (+1), mass 1, located in the nucleus.
- **Neutron**: Neutral charge (0), mass 1, located in the nucleus.
- **Electron**: Negative charge (-1), negligible mass, orbits the nucleus.

## 2. Atomic Number & Mass Number
- **Atomic Number (Z)**: Number of protons in the nucleus (defines the element).
- **Mass Number (A)**: Total number of protons and neutrons.

## 3. Isotopes
- Atoms of the same element with the same number of protons but different number of neutrons.
- Example: Carbon-12 and Carbon-14.
    `,
  },
  {
    id: 'guide-18',
    title: 'Sociology: Culture & Identity',
    subject: 'Sociology',
    topic: 'Socialization',
    contentType: 'Guide',
    description: 'Exploring how culture shapes individual and group identity.',
    content: `
# Sociology: Culture & Identity

## 1. What is Culture?
- The shared way of life of a group of people, including beliefs, values, and norms.
- **Material Culture**: Physical objects (e.g., tools, clothing).
- **Non-Material Culture**: Ideas and beliefs (e.g., religion, language).

## 2. Socialization
- The process by which individuals learn the culture of their society.
- **Primary Socialization**: Occurs in the family during early childhood.
- **Secondary Socialization**: Occurs in schools, peer groups, and media.

## 3. Identity
- How individuals see themselves and how others see them.
- Influenced by class, gender, ethnicity, and age.
    `,
  },
  {
    id: 'guide-19',
    title: 'English: Common Idioms',
    subject: 'English Language',
    topic: 'Figurative Language',
    contentType: 'Guide',
    description: 'A collection of common English idioms and their meanings.',
    content: `
# English: Common Idioms

## 1. What is an Idiom?
- A group of words whose meaning is different from the literal meaning of the individual words.

## 2. Examples
- **"Piece of cake"**: Something very easy.
- **"Break a leg"**: Good luck (often used in theater).
- **"Under the weather"**: Feeling sick.
- **"Once in a blue moon"**: Very rarely.
- **"Bite the bullet"**: To endure a painful or difficult situation.

## 3. Usage
- Idioms add color and flavor to writing and speech, but should be used sparingly in formal contexts.
    `,
  },
  {
    id: 'guide-20',
    title: 'Accounting: Ledger Accounts',
    subject: 'Accounting',
    topic: 'Double Entry',
    contentType: 'Guide',
    description: 'How to record transactions in T-accounts and ledgers.',
    content: `
# Accounting: Ledger Accounts

## 1. The T-Account
- A visual representation of a ledger account.
- Left side: Debit (Dr).
- Right side: Credit (Cr).

## 2. Recording Transactions
- **Assets**: Increase (Debit), Decrease (Credit).
- **Liabilities**: Increase (Credit), Decrease (Debit).
- **Equity**: Increase (Credit), Decrease (Debit).
- **Income**: Increase (Credit), Decrease (Debit).
- **Expenses**: Increase (Debit), Decrease (Credit).

## 3. Balancing Accounts
- Total the debits and credits.
- Find the difference (Balance c/d).
- Carry the balance forward to the next period (Balance b/d).
    `,
  },
  {
    id: 'guide-21',
    title: 'Economics: Supply & Demand',
    subject: 'Economics',
    topic: 'Market Equilibrium',
    contentType: 'Guide',
    description: 'The fundamental laws of supply and demand and how they determine price.',
    content: `
# Economics: Supply & Demand

## 1. Law of Demand
- As price increases, quantity demanded decreases (inverse relationship).
- Factors affecting demand: Income, tastes, price of substitutes/complements.

## 2. Law of Supply
- As price increases, quantity supplied increases (direct relationship).
- Factors affecting supply: Cost of production, technology, number of suppliers.

## 3. Market Equilibrium
- The point where quantity demanded equals quantity supplied.
- **Shortage**: Demand > Supply (Price rises).
- **Surplus**: Supply > Demand (Price falls).
    `,
  },
  {
    id: 'guide-22',
    title: 'Literature: Analyzing Poetry',
    subject: 'Literature in English',
    topic: 'Literary Devices',
    contentType: 'Guide',
    description: 'How to identify and analyze common literary devices in poetry.',
    content: `
# Literature: Analyzing Poetry

## 1. Imagery
- Language that appeals to the senses (visual, auditory, olfactory, etc.).

## 2. Figures of Speech
- **Simile**: Comparison using "like" or "as".
- **Metaphor**: Direct comparison without "like" or "as".
- **Personification**: Giving human qualities to non-human things.

## 3. Structure & Sound
- **Stanza**: A group of lines in a poem.
- **Rhyme Scheme**: The pattern of rhymes at the end of lines.
- **Alliteration**: Repetition of initial consonant sounds.
    `,
  },
  {
    id: 'guide-23',
    title: 'Statistics: Data Representation',
    subject: 'Statistics',
    topic: 'Charts and Graphs',
    contentType: 'Guide',
    description: 'Common ways to visualize data and when to use them.',
    content: `
# Statistics: Data Representation

## 1. Frequency Tables
- Organizing raw data into categories with counts.

## 2. Bar Charts & Histograms
- **Bar Charts**: Used for categorical data (gaps between bars).
- **Histograms**: Used for continuous data (no gaps between bars).

## 3. Pie Charts
- Showing proportions of a whole (360 degrees = 100%).

## 4. Measures of Central Tendency
- **Mean**: Average.
- **Median**: Middle value.
- **Mode**: Most frequent value.
    `,
  },
  {
    id: 'guide-24',
    title: 'Physical Education: Health & Fitness',
    subject: 'Physical Education',
    topic: 'Components of Fitness',
    contentType: 'Guide',
    description: 'Understanding the different aspects of physical health and training.',
    content: `
# Physical Education: Health & Fitness

## 1. Health-Related Fitness
- **Cardiovascular Endurance**: Heart and lungs' ability to supply oxygen.
- **Muscular Strength**: Maximum force a muscle can exert.
- **Flexibility**: Range of motion at a joint.

## 2. Skill-Related Fitness
- **Agility**: Ability to change direction quickly.
- **Balance**: Maintaining stability.
- **Reaction Time**: Speed of response to a stimulus.

## 3. Principles of Training
- **FITT**: Frequency, Intensity, Time, Type.
- **Overload**: Pushing the body beyond its normal limits.
    `,
  },
  {
    id: 'guide-25',
    title: 'Music: Elements of Music',
    subject: 'Music',
    topic: 'Music Theory',
    contentType: 'Guide',
    description: 'The basic building blocks of music composition and performance.',
    content: `
# Music: Elements of Music

## 1. Rhythm
- The pattern of sounds and silences in time.
- **Tempo**: The speed of the music.

## 2. Melody
- A sequence of single notes that is musically satisfying.
- **Pitch**: How high or low a note is.

## 3. Harmony
- The sound of two or more notes heard simultaneously.

## 4. Dynamics
- The volume of the music (e.g., Forte - loud, Piano - soft).
    `,
  },
  {
    id: 'guide-26',
    title: 'Heritage-Based Curriculum: Philosophy',
    subject: 'Heritage-Based Curriculum',
    topic: 'Curriculum Philosophy',
    contentType: 'Guide',
    description: 'The core philosophy and goals of the new Heritage-Based Curriculum in Zimbabwe.',
    content: `
# Heritage-Based Curriculum: Philosophy & Goals

## 1. Core Philosophy
- The curriculum is rooted in **Unhu/Ubuntu** (humanity towards others).
- Focuses on national identity, patriotism, and social responsibility.

## 2. Key Goals
- To produce a student who is proud of their heritage and culture.
- To develop critical thinking, problem-solving, and entrepreneurial skills.
- To integrate indigenous knowledge systems with modern science and technology.

## 3. The Five Pillars
- **Heritage Studies**: Understanding our past and culture.
- **Science & Technology**: Driving innovation and development.
- **Mathematics**: Developing logical reasoning.
- **Languages**: Promoting national and international communication.
- **Arts & Physical Education**: Fostering creativity and health.
    `,
  },
  {
    id: 'guide-27',
    title: 'Accounts: The Trial Balance',
    subject: 'Accounting',
    topic: 'Financial Reporting',
    contentType: 'Guide',
    description: 'How to prepare and use a trial balance to check for errors.',
    content: `
# Accounting: The Trial Balance

## 1. What is a Trial Balance?
- A list of all ledger account balances at a specific date.
- Purpose: To check the mathematical accuracy of the double-entry system.

## 2. Structure
- **Debit Column**: Assets, Expenses, Drawings.
- **Credit Column**: Liabilities, Income, Capital.
- **Rule**: Total Debits must equal Total Credits.

## 3. Errors Not Revealed by a Trial Balance
- **Error of Omission**: Transaction completely left out.
- **Error of Commission**: Transaction recorded in the wrong account of the same type.
- **Error of Principle**: Transaction recorded in the wrong type of account (e.g., asset vs expense).
    `,
  },
  {
    id: 'guide-28',
    title: 'Combined Science: Human Nutrition',
    subject: 'Combined Science',
    topic: 'Biology Basics',
    contentType: 'Guide',
    description: 'Understanding the components of a balanced diet and the digestive system.',
    content: `
# Combined Science: Human Nutrition

## 1. A Balanced Diet
- Includes: Carbohydrates, Proteins, Fats, Vitamins, Minerals, Fiber, and Water.
- **Carbohydrates**: Energy source (e.g., maize, rice).
- **Proteins**: Growth and repair (e.g., beans, meat).
- **Fats**: Energy storage and insulation.

## 2. The Digestive System
- **Ingestion**: Taking in food.
- **Digestion**: Breaking down food (mechanical and chemical).
- **Absorption**: Nutrients moving into the blood.
- **Egestion**: Removal of undigested waste.

## 3. Deficiency Diseases
- **Scurvy**: Lack of Vitamin C.
- **Rickets**: Lack of Vitamin D or Calcium.
- **Kwashiorkor**: Lack of Protein.
    `,
  },
  {
    id: 'guide-29',
    title: 'Mathematics: Statistics & Probability',
    subject: 'Mathematics',
    topic: 'Data Handling',
    contentType: 'Guide',
    description: 'Core concepts of probability and statistical analysis for O-Level.',
    content: `
# Mathematics: Statistics & Probability

## 1. Probability
- Probability of an event = (Number of favorable outcomes) / (Total number of outcomes).
- Range: 0 (Impossible) to 1 (Certain).
- P(A') = 1 - P(A) (Complementary events).

## 2. Statistical Measures
- **Mean**: Sum of values / Number of values.
- **Median**: Middle value when data is ordered.
- **Mode**: Most frequent value.
- **Range**: Highest value - Lowest value.

## 3. Cumulative Frequency
- A running total of frequencies.
- Used to find the median, quartiles, and interquartile range from a graph.
    `,
  },
  {
    id: 'guide-30',
    title: 'English: Letter Writing',
    subject: 'English Language',
    topic: 'Functional Writing',
    contentType: 'Guide',
    description: 'Master the formats for formal and informal letters in ZIMSEC exams.',
    content: `
# English Language: Letter Writing

## 1. Informal Letters
- **Address**: Writer's address on the top right.
- **Date**: Below the address.
- **Salutation**: Dear [Name],
- **Tone**: Friendly and personal.
- **Ending**: Your friend, / Best wishes,

## 2. Formal Letters
- **Writer's Address**: Top right.
- **Recipient's Address**: Top left, below the writer's address.
- **Salutation**: Dear Sir/Madam, or Dear Mr./Ms. [Surname],
- **Subject Line**: RE: [Purpose of the letter]
- **Tone**: Professional and concise.
- **Ending**: Yours faithfully, (if Dear Sir/Madam) or Yours sincerely, (if named).
    `,
  },
  {
    id: 'guide-31',
    title: 'Economics: Supply and Demand',
    subject: 'Economics',
    topic: 'Microeconomics',
    contentType: 'Guide',
    description: 'The fundamental principles of supply, demand, and market equilibrium.',
    content: `
# Economics: Supply and Demand

## 1. Demand
- The quantity of a good that consumers are willing and able to buy at various prices.
- **Law of Demand**: As price increases, quantity demanded decreases (inverse relationship).

## 2. Supply
- The quantity of a good that producers are willing and able to sell at various prices.
- **Law of Supply**: As price increases, quantity supplied increases (direct relationship).

## 3. Market Equilibrium
- Occurs where Quantity Demanded = Quantity Supplied.
- The point where the supply and demand curves intersect.
- **Shortage**: Demand > Supply (price is below equilibrium).
- **Surplus**: Supply > Demand (price is above equilibrium).
    `,
  },
  {
    id: 'guide-32',
    title: 'Computer Science: Data Representation',
    subject: 'Computer Science',
    topic: 'Binary Systems',
    contentType: 'Guide',
    description: 'How computers represent data using binary, denary, and hexadecimal.',
    content: `
# Computer Science: Data Representation

## 1. Binary System (Base 2)
- Uses only 0 and 1.
- Computers use binary because they are made of transistors (on/off).

## 2. Hexadecimal (Base 16)
- Uses 0-9 and A-F (A=10, B=11, etc.).
- Used to represent large binary numbers in a more human-readable format (e.g., MAC addresses, colors).

## 3. Units of Data
- **Bit**: A single 0 or 1.
- **Byte**: 8 bits.
- **Kilobyte (KB)**: 1024 bytes.
- **Megabyte (MB)**: 1024 KB.
- **Gigabyte (GB)**: 1024 MB.
    `,
  },
  {
    id: 'guide-33',
    title: 'Business Enterprise: Entrepreneurship',
    subject: 'Business Enterprise and Skills',
    topic: 'Business Basics',
    contentType: 'Guide',
    description: 'Characteristics of an entrepreneur and the process of starting a business.',
    content: `
# Business Enterprise: Entrepreneurship

## 1. What is an Entrepreneur?
- An individual who takes the risk to start and manage a business.
- Characteristics: Risk-taker, innovative, determined, self-motivated.

## 2. Business Planning
- A document outlining the goals, strategies, and financial projections of a business.
- Importance: Securing finance, guiding the business, identifying risks.

## 3. Sources of Finance
- **Internal**: Personal savings, retained profits.
- **External**: Bank loans, grants, venture capital, crowdfunding.
    `,
  },
  {
    id: 'guide-34',
    title: 'Literature in English: Literary Devices',
    subject: 'Literature in English',
    topic: 'Analysis Skills',
    contentType: 'Guide',
    description: 'Common literary devices used in poetry, prose, and drama.',
    content: `
# Literature in English: Literary Devices

## 1. Figures of Speech
- **Simile**: Comparison using "like" or "as" (e.g., "as brave as a lion").
- **Metaphor**: Direct comparison (e.g., "the world is a stage").
- **Personification**: Giving human qualities to non-human things.

## 2. Sound Devices
- **Alliteration**: Repetition of initial consonant sounds.
- **Onomatopoeia**: Words that imitate sounds (e.g., "buzz", "hiss").
- **Rhyme**: Repetition of similar sounds at the end of lines.

## 3. Structural Elements
- **Irony**: Contrast between expectation and reality.
- **Symbolism**: Using an object to represent an idea.
- **Theme**: The central idea or message of a work.
    `,
  },
  {
    id: 'guide-35',
    title: 'Agriculture: Soil Science',
    subject: 'Agriculture',
    topic: 'Soil Management',
    contentType: 'Guide',
    description: 'Understanding soil composition, types, and fertility for agriculture.',
    content: `
# Agriculture: Soil Science

## 1. Soil Composition
- **Mineral Matter**: 45% (sand, silt, clay).
- **Organic Matter**: 5% (humus).
- **Air**: 25%.
- **Water**: 25%.

## 2. Soil Types
- **Sandy Soil**: Large particles, good drainage, low fertility.
- **Clay Soil**: Small particles, poor drainage, high fertility.
- **Loamy Soil**: Mixture of sand and clay, ideal for most crops.

## 3. Soil Fertility
- The ability of soil to provide essential nutrients for plant growth.
- Ways to improve fertility: Adding manure, fertilizers, crop rotation, liming.
    `,
  },
  {
    id: 'guide-36',
    title: 'Geography: Weather and Climate',
    subject: 'Geography',
    topic: 'Meteorology',
    contentType: 'Guide',
    description: 'Distinction between weather and climate, and factors influencing climate.',
    content: `
# Geography: Weather and Climate

## 1. Definitions
- **Weather**: The day-to-day state of the atmosphere (short-term).
- **Climate**: The average weather conditions over a long period (usually 30 years).

## 2. Weather Elements
- Temperature, Precipitation, Humidity, Wind Speed/Direction, Air Pressure.

## 3. Factors Influencing Climate
- **Latitude**: Distance from the equator.
- **Altitude**: Height above sea level.
- **Distance from the Sea**: Coastal vs. inland areas.
- **Prevailing Winds**: Direction of air masses.
    `,
  },
  {
    id: 'guide-37',
    title: 'History: The Liberation Struggle',
    subject: 'History',
    topic: 'Zimbabwean History',
    contentType: 'Guide',
    description: 'Key events and figures in the struggle for independence in Zimbabwe.',
    content: `
# History: The Liberation Struggle in Zimbabwe

## 1. Early Resistance (First Chimurenga)
- 1896-1897: Resistance against the British South Africa Company (BSAC).
- Key figures: Mbuya Nehanda, Sekuru Kaguvi.

## 2. The Second Chimurenga
- 1960s-1979: Armed struggle against the Rhodesian government.
- Major parties: ZANU (ZANLA) and ZAPU (ZIPRA).
- Key events: Battle of Chinhoyi (1966), Lancaster House Agreement (1979).

## 3. Independence
- April 18, 1980: Zimbabwe becomes an independent nation.
    `,
  }
];

const OFFLINE_PAPERS = [
  {
    id: 'paper-1',
    title: 'Mathematics Paper 1 (Non-Calculator) - Practice 1',
    subject: 'Mathematics',
    topic: 'General Mathematics',
    contentType: 'Practice Paper',
    description: 'A full practice paper for ZIMSEC O-Level Mathematics Paper 1.',
    content: `
# Mathematics Paper 1 Practice

## Section A (40 Marks)
Answer all questions.

1. (a) Calculate 0.04 × 0.2. [1]
   (b) Express 3/8 as a percentage. [1]

2. Simplify: 3(x - 2) - 2(2x + 1). [2]

3. Solve the equation: 2p/3 + 1 = 7. [2]

4. A map is drawn to a scale of 1:50,000. Calculate the actual distance, in km, represented by a line 12cm long on the map. [3]

5. Factorise completely: 4ax - 2ay + 6bx - 3by. [3]

## Section B (60 Marks)
Answer any four questions.

6. (a) Given that matrix A = [[2, 1], [4, 3]], find A⁻¹. [3]
   (b) Use matrix method to solve:
       2x + y = 5
       4x + 3y = 13 [4]
    `
  },
  {
    id: 'paper-2',
    title: 'English Language Paper 1 - Composition Practice',
    subject: 'English Language',
    topic: 'Composition',
    contentType: 'Practice Paper',
    description: 'Practice topics for ZIMSEC English Language Paper 1 (Section A and B).',
    content: `
# English Language Paper 1 Practice

## Section A: Directed Writing (30 Marks)
You are the secretary of the school's Environmental Club. Write a report to the Headmaster suggesting ways to improve the school's waste management system.
Include:
- Current problems with waste disposal.
- Proposed solutions (e.g., recycling bins, composting).
- Benefits to the school community. [30]

## Section B: Composition (50 Marks)
Write a composition on ONE of the following topics:
1. Describe a local market on a busy Saturday morning.
2. "Technology has done more harm than good to students." Do you agree?
3. Write a story ending with the words: "...I realized then that honesty is indeed the best policy."
4. The importance of preserving our cultural heritage. [50]
    `
  },
  {
    id: 'paper-3',
    title: 'Combined Science Paper 2 - Theory Practice',
    subject: 'Combined Science',
    topic: 'General Science',
    contentType: 'Practice Paper',
    description: 'Theory questions covering Biology, Chemistry, and Physics sections.',
    content: `
# Combined Science Paper 2 Practice

## Section A: Biology
1. (a) Define osmosis. [2]
   (b) Explain why a plant cell does not burst when placed in pure water. [3]

## Section B: Chemistry
2. (a) Describe the test for Oxygen gas. [2]
   (b) State two uses of Nitrogen in industry. [2]

## Section C: Physics
3. (a) State the principle of moments. [2]
   (b) A uniform beam of length 2m is pivoted at its center. A weight of 10N is placed 0.5m from the pivot. Calculate the weight needed at the other end, 0.8m from the pivot, to balance the beam. [4]
    `
  },
  {
    id: 'paper-4',
    title: 'History Paper 1 - Southern Africa',
    subject: 'History',
    topic: 'Southern Africa',
    contentType: 'Practice Paper',
    description: 'Practice questions on the history of Southern Africa.',
    content: `
# History Paper 1 Practice

## Section A
1. (a) Name any three groups of people who lived in Southern Africa before the arrival of the Bantu. [3]
   (b) Describe the social organization of the San people. [6]
   (c) To what extent did the environment influence the San way of life? [11]

## Section B
2. (a) State any three reasons for the rise of the Mutapa State. [3]
   (b) Describe the political structure of the Mutapa State. [6]
   (c) How important was trade in the Mutapa State? [11]
    `
  },
  {
    id: 'paper-5',
    title: 'Geography Paper 1 - Physical Geography',
    subject: 'Geography',
    topic: 'Physical Geography',
    contentType: 'Practice Paper',
    description: 'Practice questions on weather, climate, and landforms.',
    content: `
# Geography Paper 1 Practice

## Section A
1. (a) Define the term "weathering". [2]
   (b) Describe the process of carbonation in limestone areas. [5]
   (c) Explain how human activities can accelerate the process of soil erosion. [8]

## Section B
2. (a) Name three types of rainfall. [3]
   (b) Describe the formation of relief rainfall. [6]
   (c) To what extent is rainfall the most important weather element in Zimbabwe? [11]
    `
  },
  {
    id: 'paper-6',
    title: 'Biology Paper 1 (Multiple Choice) - Practice',
    subject: 'Biology',
    topic: 'General Biology',
    contentType: 'Practice Paper',
    description: '40 multiple choice questions covering the ZIMSEC O-Level Biology syllabus.',
    content: `
# Biology Paper 1 Practice

1. Which of the following is a characteristic of all living organisms?
   A. Movement
   B. Photosynthesis
   C. Breathing
   D. Ingestion

2. What is the function of the ribosome?
   A. Energy production
   B. Protein synthesis
   C. Storage of genetic material
   D. Digestion of waste

3. Which enzyme breaks down starch into maltose?
   A. Protease
   B. Lipase
   C. Amylase
   D. Maltase

4. The process by which plants lose water vapor through their leaves is called:
   A. Osmosis
   B. Transpiration
   C. Respiration
   D. Diffusion
    `
  },
  {
    id: 'paper-7',
    title: 'Chemistry Paper 1 (Multiple Choice) - Practice',
    subject: 'Chemistry',
    topic: 'General Chemistry',
    contentType: 'Practice Paper',
    description: '40 multiple choice questions covering the ZIMSEC O-Level Chemistry syllabus.',
    content: `
# Chemistry Paper 1 Practice

1. Which state of matter has a fixed volume but no fixed shape?
   A. Solid
   B. Liquid
   C. Gas
   D. Plasma

2. What is the atomic number of an atom?
   A. Number of protons
   B. Number of neutrons
   C. Number of electrons
   D. Sum of protons and neutrons

3. Which of the following is a noble gas?
   A. Oxygen
   B. Nitrogen
   C. Helium
   D. Hydrogen

4. The reaction between an acid and a base to form salt and water is called:
   A. Oxidation
   B. Reduction
   C. Neutralization
   D. Combustion
    `
  },
  {
    id: 'paper-8',
    title: 'Physics Paper 1 (Multiple Choice) - Practice',
    subject: 'Physics',
    topic: 'General Physics',
    contentType: 'Practice Paper',
    description: '40 multiple choice questions covering the ZIMSEC O-Level Physics syllabus.',
    content: `
# Physics Paper 1 Practice

1. Which of the following is a vector quantity?
   A. Mass
   B. Distance
   C. Velocity
   D. Time

2. What is the unit of force?
   A. Joule
   B. Watt
   C. Newton
   D. Pascal

3. The bending of light as it passes from one medium to another is called:
   A. Reflection
   B. Refraction
   C. Diffraction
   D. Interference

4. What is the formula for density?
   A. Mass × Volume
   B. Mass / Volume
   C. Volume / Mass
   D. Force / Area
    `
  },
  {
    id: 'paper-9',
    title: 'Agriculture Paper 1 - Practice',
    subject: 'Agriculture',
    topic: 'General Agriculture',
    contentType: 'Practice Paper',
    description: 'Practice questions covering crop and livestock production.',
    content: `
# Agriculture Paper 1 Practice

1. (a) State three advantages of using organic manure. [3]
   (b) Describe the process of making compost. [6]

2. (a) Name two types of irrigation systems used in Zimbabwe. [2]
   (b) Explain the importance of drainage in crop production. [4]

3. (a) List three common diseases of cattle. [3]
   (b) Describe the symptoms of Foot and Mouth disease. [5]
    `
  },
  {
    id: 'paper-10',
    title: 'Commerce Paper 1 - Practice',
    subject: 'Commerce',
    topic: 'General Commerce',
    contentType: 'Practice Paper',
    description: 'Practice questions on trade, banking, and insurance.',
    content: `
# Commerce Paper 1 Practice

1. (a) Distinguish between home trade and foreign trade. [4]
   (b) Explain the role of wholesalers in the chain of distribution. [6]

2. (a) State three functions of a commercial bank. [3]
   (b) Describe the difference between a current account and a savings account. [4]

3. (a) Define the term "insurance". [2]
   (b) Explain the principle of "Utmost Good Faith" in insurance. [4]
    `
  }
];

const OFFLINE_TEXTBOOKS = [
  {
    id: 'textbook-1',
    title: 'Mathematics: Algebra Fundamentals',
    subject: 'Mathematics',
    topic: 'Algebra',
    contentType: 'Textbook Chapter',
    description: 'Chapter 1: Introduction to Algebraic Expressions and Equations.',
    content: `
# Chapter 1: Algebra Fundamentals

## Objectives
- Understand algebraic variables and constants.
- Simplify algebraic expressions.
- Solve linear equations.

## Key Terms
- **Variable**: A symbol (usually a letter) representing an unknown value.
- **Coefficient**: The number multiplying a variable.
- **Equation**: A mathematical statement that two expressions are equal.

## Content
Algebra is the branch of mathematics that uses symbols to represent numbers in formulas and equations. In Zimbabwe, algebra is a core component of the ZIMSEC syllabus. It allows us to solve problems where some values are unknown.

## Worked Examples
1. Simplify: 2x + 3y - x + 4y
   Solution: (2x - x) + (3y + 4y) = x + 7y

2. Solve for x: 3x + 5 = 20
   Solution: 3x = 15 => x = 5

## Heritage Connections
In traditional Zimbabwean construction, such as building a round hut (imba), proportions and measurements are used that can be described algebraically. The relationship between the diameter and the circumference of the hut is a constant ratio.

## Summary
Algebra uses variables to represent unknowns. Simplifying expressions involves grouping like terms. Linear equations can be solved by isolating the variable.
    `
  },
  {
    id: 'textbook-2',
    title: 'English Language: Mastering Composition',
    subject: 'English Language',
    topic: 'Writing Skills',
    contentType: 'Textbook Chapter',
    description: 'Chapter 5: Narrative and Descriptive Writing Techniques.',
    content: `
# Chapter 5: Mastering Composition

## Objectives
- Learn the structure of a narrative essay.
- Use descriptive language effectively.
- Understand the importance of plot and character development.

## Key Terms
- **Narrative**: A story or account of events.
- **Adjective**: A word that describes a noun.
- **Climax**: The most intense or important point of a story.

## Content
Writing a good composition requires planning and creativity. Narrative writing tells a story, while descriptive writing paints a picture with words. In ZIMSEC English Language Paper 1, students are often asked to write a narrative or descriptive essay.

## Worked Examples
*Descriptive snippet*: "The sun dipped below the horizon, casting a golden glow over the balancing rocks of Epworth, turning the ancient granite into shimmering embers."

## Heritage Connections
Zimbabwe has a rich oral tradition of storytelling (ngano). These stories often have a moral lesson and use vivid descriptions of animals and nature to engage the listener.

## Summary
Good compositions have a clear beginning, middle, and end. Use sensory details to make your writing more descriptive.
    `
  },
  {
    id: 'textbook-3',
    title: 'Combined Science: The Human Body',
    subject: 'Combined Science',
    topic: 'Biology',
    contentType: 'Textbook Chapter',
    description: 'Chapter 3: The Circulatory and Respiratory Systems.',
    content: `
# Chapter 3: The Human Body

## Objectives
- Identify the components of the circulatory system.
- Understand the process of gas exchange in the lungs.
- Explain the relationship between exercise and heart rate.

## Key Terms
- **Artery**: A blood vessel that carries blood away from the heart.
- **Alveoli**: Tiny air sacs in the lungs where gas exchange occurs.
- **Hemoglobin**: The protein in red blood cells that carries oxygen.

## Content
The human body is a complex system of organs working together. The circulatory system transports nutrients and oxygen, while the respiratory system brings in oxygen and removes carbon dioxide.

## Worked Examples
*Question*: Why does heart rate increase during exercise?
*Answer*: During exercise, muscles need more oxygen and energy. The heart pumps faster to deliver oxygenated blood to the active muscles.

## Heritage Connections
Traditional Zimbabwean diets, rich in small grains like finger millet (zviyo) and indigenous vegetables, provide essential nutrients that support a healthy circulatory system.

## Summary
The heart pumps blood through a network of vessels. Lungs facilitate the exchange of oxygen and carbon dioxide.
    `
  },
  {
    id: 'textbook-4',
    title: 'History: The Great Zimbabwe Civilization',
    subject: 'History',
    topic: 'Pre-colonial Zimbabwe',
    contentType: 'Textbook Chapter',
    description: 'Chapter 2: The Rise and Fall of the Great Zimbabwe State.',
    content: `
# Chapter 2: The Great Zimbabwe Civilization

## Objectives
- Describe the origins of Great Zimbabwe.
- Analyze the social, economic, and political structure of the state.
- Explain the reasons for the decline of the civilization.

## Key Terms
- **Enclosure**: A walled area within the city.
- **Monolith**: A large single upright block of stone.
- **Trans-Saharan Trade**: Trade routes across the Sahara desert (though Great Zimbabwe traded more with the East Coast).

## Content
Great Zimbabwe was a powerful medieval city in the south-eastern hills of Zimbabwe. It was the capital of the Kingdom of Zimbabwe during the country's Late Iron Age.

## Worked Examples
*Question*: List three economic activities of the Great Zimbabwe people.
*Answer*: Cattle herding, crop cultivation, and gold mining/trade.

## Heritage Connections
The Zimbabwe Bird, found at the site, is now a national symbol. The dry-stone walling technique used at Great Zimbabwe is a testament to the engineering skills of our ancestors.

## Summary
Great Zimbabwe was a major trade center. Its decline was likely due to environmental factors and shifting trade routes.
    `
  },
  {
    id: 'textbook-5',
    title: 'Geography: Physical Landscapes of Zimbabwe',
    subject: 'Geography',
    topic: 'Physical Geography',
    contentType: 'Textbook Chapter',
    description: 'Chapter 4: Relief and Drainage Systems.',
    content: `
# Chapter 4: Physical Landscapes of Zimbabwe

## Objectives
- Identify the major relief regions of Zimbabwe (Highveld, Middleveld, Lowveld).
- Describe the major river systems (Zambezi, Limpopo, Save).
- Understand the impact of relief on climate and agriculture.

## Key Terms
- **Escarpment**: A long, steep slope, especially one at the edge of a plateau.
- **Catchment Area**: The area from which rainfall flows into a river.
- **Plateau**: An area of relatively level high ground.

## Content
Zimbabwe's landscape is dominated by a central plateau known as the Highveld. This region is surrounded by the Middleveld and the Lowveld.

## Worked Examples
*Question*: Name the highest point in Zimbabwe.
*Answer*: Mount Nyangani in the Eastern Highlands.

## Heritage Connections
The Zambezi River is home to the mighty Victoria Falls (Mosi-oa-Tunya - The Smoke That Thunders), a UNESCO World Heritage site and a source of national pride.

## Summary
Zimbabwe has three main relief regions. The drainage system is dominated by the Zambezi and Limpopo basins.
    `
  },
  {
    id: 'textbook-6',
    title: 'Agriculture: Soil Science and Management',
    subject: 'Agriculture',
    topic: 'Soil Science',
    contentType: 'Textbook Chapter',
    description: 'Chapter 1: Understanding Soil Composition and Fertility.',
    content: `
# Chapter 1: Soil Science and Management

## Objectives
- Describe the components of soil.
- Understand the importance of soil pH.
- Learn about soil conservation techniques.

## Key Terms
- **Humus**: Organic matter in the soil.
- **Leaching**: The process of nutrients being washed out of the soil.
- **Erosion**: The wearing away of the topsoil.

## Content
Soil is the foundation of agriculture. In Zimbabwe, soil types vary from the sandy soils of the Kalahari sands to the rich red clay soils of the Highveld.

## Worked Examples
*Question*: How can a farmer improve soil fertility?
*Answer*: By adding organic manure, using crop rotation, and applying fertilizers.

## Heritage Connections
Traditional Zimbabwean farmers used "pfumvudza" (conservation agriculture) techniques long before they were modernized, focusing on minimal soil disturbance and mulching.

## Summary
Soil is composed of minerals, organic matter, air, and water. Proper management is essential for sustainable farming.
    `
  },
  {
    id: 'textbook-7',
    title: 'Commerce: The Chain of Distribution',
    subject: 'Commerce',
    topic: 'Trade',
    contentType: 'Textbook Chapter',
    description: 'Chapter 3: How Goods Move from Producer to Consumer.',
    content: `
# Chapter 3: The Chain of Distribution

## Objectives
- Identify the participants in the chain of distribution.
- Understand the role of wholesalers and retailers.
- Learn about modern trends in distribution (e.g., e-commerce).

## Key Terms
- **Wholesaler**: A business that buys in bulk and sells to retailers.
- **Retailer**: A business that sells directly to the final consumer.
- **Middleman**: An intermediary in the distribution process.

## Content
The chain of distribution is the path that goods take from the manufacturer to the final user. In Zimbabwe, this often involves several stages, especially for imported goods.

## Worked Examples
*Question*: What is the main function of a retailer?
*Answer*: To break bulk and sell goods in small quantities to consumers.

## Heritage Connections
Traditional markets (musika) like Mbare Musika in Harare are vital hubs in the distribution of agricultural produce in Zimbabwe.

## Summary
The distribution chain ensures goods reach consumers efficiently. Wholesalers and retailers play key roles.
    `
  },
  {
    id: 'textbook-8',
    title: 'Accounting: Double-Entry Bookkeeping',
    subject: 'Accounting',
    topic: 'Bookkeeping',
    contentType: 'Textbook Chapter',
    description: 'Chapter 2: The Principles of Double-Entry.',
    content: `
# Chapter 2: Double-Entry Bookkeeping

## Objectives
- Understand the dual aspect of every transaction.
- Learn the rules of debit and credit.
- Record transactions in the ledger.

## Key Terms
- **Debit (Dr)**: An entry on the left side of an account.
- **Credit (Cr)**: An entry on the right side of an account.
- **Ledger**: A book or electronic record of accounts.

## Content
Double-entry bookkeeping is the standard method of recording financial transactions. Every transaction affects at least two accounts.

## Worked Examples
*Transaction*: Bought equipment for $500 cash.
*Entry*: Debit Equipment Account, Credit Cash Account.

## Heritage Connections
Many small-scale Zimbabwean entrepreneurs use informal bookkeeping methods. Modern accounting helps these businesses grow and access formal credit.

## Summary
For every debit, there must be a corresponding credit. The accounting equation must always balance.
    `
  },
  {
    id: 'textbook-9',
    title: 'Economics: Supply and Demand',
    subject: 'Economics',
    topic: 'Microeconomics',
    contentType: 'Textbook Chapter',
    description: 'Chapter 4: Market Forces and Price Determination.',
    content: `
# Chapter 4: Supply and Demand

## Objectives
- Define the law of demand and the law of supply.
- Understand the factors that shift demand and supply curves.
- Identify the equilibrium price.

## Key Terms
- **Equilibrium**: The point where quantity demanded equals quantity supplied.
- **Shortage**: When quantity demanded exceeds quantity supplied.
- **Surplus**: When quantity supplied exceeds quantity demanded.

## Content
In a market economy, prices are determined by the interaction of buyers (demand) and sellers (supply).

## Worked Examples
*Scenario*: A bumper harvest of maize in Zimbabwe.
*Effect*: Supply increases, leading to a lower equilibrium price for maize.

## Heritage Connections
The price of staple foods like maize meal is a critical economic and social issue in Zimbabwe, often influenced by government policy and seasonal harvests.

## Summary
Demand and supply curves intersect at the equilibrium point. Changes in market conditions shift these curves.
    `
  },
  {
    id: 'textbook-10',
    title: 'Computer Science: Computer Hardware',
    subject: 'Computer Science',
    topic: 'Hardware',
    contentType: 'Textbook Chapter',
    description: 'Chapter 1: Components of a Computer System.',
    content: `
# Chapter 1: Computer Hardware

## Objectives
- Identify internal and external hardware components.
- Understand the function of the CPU, RAM, and storage.
- Learn about input and output devices.

## Key Terms
- **CPU**: The "brain" of the computer (Central Processing Unit).
- **RAM**: Temporary memory used by the computer (Random Access Memory).
- **Motherboard**: The main circuit board of the computer.

## Content
Hardware refers to the physical parts of a computer system. Understanding how these parts work together is fundamental to computer science.

## Worked Examples
*Question*: What is the difference between RAM and a Hard Drive?
*Answer*: RAM is fast, temporary storage used by the CPU, while a Hard Drive is slower, permanent storage for files and programs.

## Heritage Connections
Zimbabwe is increasingly investing in ICT infrastructure and local assembly of computers to bridge the digital divide and empower students.

## Summary
A computer system consists of input, processing, output, and storage devices.
    `
  },
  {
    id: 'textbook-11',
    title: 'Sociology: The Family in Zimbabwe',
    subject: 'Sociology',
    topic: 'The Family',
    contentType: 'Textbook Chapter',
    description: 'Chapter 2: Types of Families and Changing Roles.',
    content: `
# Chapter 2: The Family in Zimbabwe

## Objectives
- Define the family and its functions.
- Distinguish between nuclear and extended families.
- Analyze the impact of urbanization on the Zimbabwean family.

## Key Terms
- **Nuclear Family**: A family consisting of parents and their children.
- **Extended Family**: A family that extends beyond the nuclear family, including grandparents, aunts, uncles, etc.
- **Urbanization**: The process of making an area more urban.

## Content
The family is the basic unit of society. In Zimbabwe, the extended family has traditionally been the primary support system, but this is changing due to economic and social factors.

## Worked Examples
*Question*: What are the main functions of the family?
*Answer*: Socialization of children, emotional support, and economic cooperation.

## Heritage Connections
The concept of "ukama" (relatedness) is central to Zimbabwean culture, emphasizing the bonds between family members and ancestors.

## Summary
The family structure in Zimbabwe is evolving. Both nuclear and extended families play important roles.
    `
  },
  {
    id: 'textbook-12',
    title: 'Heritage Studies: National Identity',
    subject: 'Heritage Studies',
    topic: 'Identity',
    contentType: 'Textbook Chapter',
    description: 'Chapter 1: Symbols and Values of Zimbabwe.',
    content: `
# Chapter 1: National Identity

## Objectives
- Identify the national symbols of Zimbabwe.
- Understand the significance of the national flag and anthem.
- Discuss the values that define Zimbabwean identity.

## Key Terms
- **Patriotism**: Love for and devotion to one's country.
- **Sovereignty**: The authority of a state to govern itself.
- **Heritage**: Property that is or may be inherited; an inheritance.

## Content
National identity is the sense of a nation as a cohesive whole, as represented by distinctive traditions, culture, and language.

## Worked Examples
*Question*: What do the colors of the Zimbabwe flag represent?
*Answer*: Green (agriculture), Yellow (minerals), Red (blood of liberation), Black (native people), White (peace).

## Heritage Connections
The Great Zimbabwe ruins are a powerful symbol of our national identity and a reminder of our glorious past.

## Summary
National symbols and values unite Zimbabweans and foster a sense of pride and belonging.
    `
  },
  {
    id: 'textbook-13',
    title: 'Grade 7 Mathematics: Number Systems',
    subject: 'Grade 7 Mathematics',
    topic: 'Numbers',
    contentType: 'Textbook Chapter',
    description: 'Chapter 1: Whole Numbers, Decimals, and Fractions.',
    content: `
# Chapter 1: Number Systems

## Objectives
- Perform operations with large whole numbers.
- Understand place value in decimals.
- Convert between fractions, decimals, and percentages.

## Key Terms
- **Integer**: A whole number (not a fractional number).
- **Numerator**: The top number in a fraction.
- **Denominator**: The bottom number in a fraction.

## Content
Numbers are the building blocks of mathematics. Mastering basic operations is essential for success in higher-level math.

## Worked Examples
*Question*: Convert 3/4 to a percentage.
*Answer*: (3/4) * 100 = 75%.

## Heritage Connections
Traditional Zimbabwean counting systems often used physical objects like stones or sticks, and some indigenous languages have unique ways of naming large numbers.

## Summary
Understanding place value and operations is fundamental. Fractions, decimals, and percentages are different ways of representing the same values.
    `
  },
  {
    id: 'textbook-14',
    title: 'Literature in English: Introduction to Poetry',
    subject: 'Literature in English',
    topic: 'Poetry',
    contentType: 'Textbook Chapter',
    description: 'Chapter 4: Analyzing Poetic Devices and Themes.',
    content: `
# Chapter 4: Introduction to Poetry

## Objectives
- Identify common poetic devices (simile, metaphor, personification).
- Analyze the tone and mood of a poem.
- Understand the relationship between form and meaning.

## Key Terms
- **Stanza**: A group of lines in a poem.
- **Rhyme Scheme**: The ordered pattern of rhymes at the ends of the lines of a poem.
- **Imagery**: Visually descriptive or figurative language.

## Content
Poetry is a form of literature that uses aesthetic and rhythmic qualities of language to evoke meanings in addition to, or in place of, the prosaic ostensible meaning.

## Worked Examples
*Analysis*: "The wind whispered through the trees" - This is personification, giving the wind human qualities.

## Heritage Connections
Zimbabwean poets like Dambudzo Marechera and Chenjerai Hove have used poetry to explore themes of identity, struggle, and the beauty of the Zimbabwean landscape.

## Summary
Poetry uses figurative language to convey deep emotions and ideas. Analyzing devices helps us understand the poet's message.
    `
  },
  {
    id: 'textbook-15',
    title: 'Business Enterprise: Entrepreneurship',
    subject: 'Business Enterprise and Skills',
    topic: 'Entrepreneurship',
    contentType: 'Textbook Chapter',
    description: 'Chapter 1: Characteristics of a Successful Entrepreneur.',
    content: `
# Chapter 1: Entrepreneurship

## Objectives
- Define entrepreneurship.
- Identify the traits of successful entrepreneurs.
- Understand the role of entrepreneurs in the economy.

## Key Terms
- **Innovation**: The action or process of innovating.
- **Risk-taking**: The action of taking risks.
- **Profit**: A financial gain.

## Content
Entrepreneurship is the process of designing, launching, and running a new business. Entrepreneurs are innovators who take risks to bring new products or services to the market.

## Worked Examples
*Question*: List three traits of a successful entrepreneur.
*Answer*: Resilience, creativity, and strong leadership.

## Heritage Connections
Zimbabwe has a vibrant informal sector where many small-scale entrepreneurs demonstrate incredible resilience and innovation in the face of economic challenges.

## Summary
Entrepreneurs drive economic growth through innovation and job creation.
    `
  }
];

const OFFLINE_FLASHCARDS = [
  {
    id: 'fc-1',
    subject: 'Heritage Studies',
    topic: 'National Symbols',
    cards: [
      { question: 'What does the Zimbabwe Bird represent?', answer: 'The national emblem, representing the history and identity of Zimbabwe.' },
      { question: 'What do the colors of the flag represent?', answer: 'Green (agriculture), Yellow (minerals), Red (blood of liberation), Black (native people), White (peace).' },
      { question: 'What is the national motto of Zimbabwe?', answer: 'Unity, Freedom, Work.' }
    ]
  },
  {
    id: 'fc-2',
    subject: 'Mathematics',
    topic: 'Geometry',
    cards: [
      { question: 'What is the sum of angles in a triangle?', answer: '180 degrees.' },
      { question: 'What is the formula for the area of a circle?', answer: 'πr² (pi times radius squared).' },
      { question: 'What is a right-angled triangle?', answer: 'A triangle with one angle equal to 90 degrees.' }
    ]
  },
  {
    id: 'fc-3',
    subject: 'History',
    topic: 'Great Zimbabwe',
    cards: [
      { question: 'Who built Great Zimbabwe?', answer: 'The ancestors of the Shona people (Gokomere/Ziwa cultures).' },
      { question: 'What was the main purpose of the Great Enclosure?', answer: 'A royal residence or a religious center.' },
      { question: 'What led to the decline of Great Zimbabwe?', answer: 'Overpopulation, environmental degradation, and the shift of trade routes.' }
    ]
  },
  {
    id: 'fc-4',
    subject: 'Biology',
    topic: 'Cell Biology',
    cards: [
      { question: 'What is the "powerhouse" of the cell?', answer: 'Mitochondria.' },
      { question: 'Which organelle is responsible for photosynthesis?', answer: 'Chloroplast.' },
      { question: 'What is the function of the cell membrane?', answer: 'Controls what enters and leaves the cell.' }
    ]
  },
  {
    id: 'fc-5',
    subject: 'Geography',
    topic: 'Rivers',
    cards: [
      { question: 'What is a river delta?', answer: 'A landform created by deposition of sediment at the mouth of a river.' },
      { question: 'What is the source of a river?', answer: 'The starting point of a river (e.g., a spring or glacier).' },
      { question: 'What is a tributary?', answer: 'A smaller stream or river that flows into a larger one.' }
    ]
  },
  {
    id: 'fc-6',
    subject: 'Commerce',
    topic: 'Accounting Equation',
    cards: [
      { question: 'What is the basic accounting equation?', answer: 'Assets = Liabilities + Equity.' },
      { question: 'What is an asset?', answer: 'A resource owned by a business (e.g., cash, equipment).' },
      { question: 'What is a liability?', answer: 'A debt or obligation owed by a business (e.g., a loan).' }
    ]
  },
  {
    id: 'fc-7',
    subject: 'Chemistry',
    topic: 'Acids & Bases',
    cards: [
      { question: 'What is the pH of a neutral substance?', answer: '7.' },
      { question: 'What color does litmus paper turn in an acid?', answer: 'Red.' },
      { question: 'What is a base that dissolves in water called?', answer: 'An alkali.' }
    ]
  },
  {
    id: 'fc-8',
    subject: 'Physics',
    topic: 'Electricity',
    cards: [
      { question: 'What is the unit of electric current?', answer: 'Ampere (A).' },
      { question: 'What is Ohm\'s Law?', answer: 'V = IR (Voltage = Current × Resistance).' },
      { question: 'What is a conductor?', answer: 'A material that allows electricity to flow through it easily.' }
    ]
  },
  {
    id: 'fc-9',
    subject: 'English Language',
    topic: 'Synonyms',
    cards: [
      { question: 'What is a synonym for "Happy"?', answer: 'Joyful, Cheerful, Content.' },
      { question: 'What is a synonym for "Fast"?', answer: 'Quick, Rapid, Swift.' },
      { question: 'What is a synonym for "Large"?', answer: 'Big, Enormous, Huge.' }
    ]
  },
  {
    id: 'fc-10',
    subject: 'Agriculture',
    topic: 'Crop Pests',
    cards: [
      { question: 'What is an example of a biting and chewing pest?', answer: 'Grasshopper or Locust.' },
      { question: 'How do aphids damage crops?', answer: 'By sucking sap from the leaves and stems.' },
      { question: 'What is a biological control method for pests?', answer: 'Using natural predators (e.g., ladybirds for aphids).' }
    ]
  },
  {
    id: 'fc-11',
    subject: 'Heritage Studies',
    topic: 'Traditional Leaders',
    cards: [
      { question: 'What is the role of a Chief in Zimbabwe?', answer: 'To uphold traditional values, resolve local disputes, and manage communal land.' },
      { question: 'Who is a Headman?', answer: 'A leader who assists the Chief in managing a specific area or group of villages.' },
      { question: 'What is the significance of the "Dare" or "Inkundla"?', answer: 'A traditional court or meeting place where community issues are discussed.' }
    ]
  },
  {
    id: 'fc-12',
    subject: 'Combined Science',
    topic: 'Energy',
    cards: [
      { question: 'What is the law of conservation of energy?', answer: 'Energy cannot be created or destroyed, only transformed from one form to another.' },
      { question: 'What is renewable energy?', answer: 'Energy from sources that are naturally replenished (e.g., solar, wind).' },
      { question: 'What is the unit of energy?', answer: 'Joule (J).' }
    ]
  },
  {
    id: 'fc-13',
    subject: 'Accounting',
    topic: 'Cash Book',
    cards: [
      { question: 'What is a two-column cash book?', answer: 'A cash book with columns for cash and bank transactions.' },
      { question: 'What is a contra entry?', answer: 'A transaction that involves both cash and bank accounts (e.g., depositing cash into the bank).' },
      { question: 'On which side are receipts recorded in the cash book?', answer: 'The debit (left) side.' }
    ]
  },
  {
    id: 'fc-14',
    subject: 'Sociology',
    topic: 'The Family',
    cards: [
      { question: 'What is a nuclear family?', answer: 'A family consisting of parents and their children living together.' },
      { question: 'What is an extended family?', answer: 'A family that includes relatives beyond the nuclear family (e.g., grandparents, aunts, uncles).' },
      { question: 'What is socialization?', answer: 'The process of learning the norms and values of a society.' }
    ]
  },
  {
    id: 'fc-15',
    subject: 'Economics',
    topic: 'Opportunity Cost',
    cards: [
      { question: 'What is opportunity cost?', answer: 'The next best alternative foregone when a choice is made.' },
      { question: 'Why does opportunity cost exist?', answer: 'Because resources are scarce but wants are infinite.' },
      { question: 'Give an example of opportunity cost for a student.', answer: 'Choosing to study for an exam instead of watching a movie.' }
    ]
  },
  {
    id: 'fc-16',
    subject: 'Computer Science',
    topic: 'Input/Output Devices',
    cards: [
      { question: 'What is an input device?', answer: 'A device used to enter data into a computer (e.g., keyboard, mouse).' },
      { question: 'What is an output device?', answer: 'A device used to present data from a computer (e.g., monitor, printer).' },
      { question: 'Is a touch screen an input or output device?', answer: 'Both.' }
    ]
  },
  {
    id: 'fc-17',
    subject: 'Business Enterprise and Skills',
    topic: 'Marketing',
    cards: [
      { question: 'What are the 4 Ps of marketing?', answer: 'Product, Price, Place, Promotion.' },
      { question: 'What is market research?', answer: 'The process of gathering information about consumers\' needs and preferences.' },
      { question: 'What is a brand?', answer: 'A name, term, or design that identifies a seller\'s product.' }
    ]
  },
  {
    id: 'fc-18',
    subject: 'Agriculture',
    topic: 'Livestock',
    cards: [
      { question: 'What is a ruminant animal?', answer: 'An animal with a four-chambered stomach (e.g., cow, goat).' },
      { question: 'What is the gestation period of a cow?', answer: 'Approximately 283 days (9 months).' },
      { question: 'What is weaning?', answer: 'The process of gradually withdrawing a young animal from its mother\'s milk.' }
    ]
  },
  {
    id: 'fc-19',
    subject: 'Geography',
    topic: 'Plate Tectonics',
    cards: [
      { question: 'What is the theory of plate tectonics?', answer: 'The Earth\'s outer shell is divided into several plates that glide over the mantle.' },
      { question: 'What is a subduction zone?', answer: 'A region where one tectonic plate is being forced under another.' },
      { question: 'What causes earthquakes?', answer: 'The sudden release of energy in the Earth\'s crust that creates seismic waves.' }
    ]
  }
];

function CloudLibraryModal({ onClose, onDownload, onSyncPublic, isSyncing, materials, isAdmin }: {
  onClose: () => void;
  onDownload: (material: SavedMaterial) => void;
  onSyncPublic: () => void;
  isSyncing: boolean;
  materials: SavedMaterial[];
  isAdmin: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = materials.filter(m => 
    m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.contentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
    >
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cloud className="w-5 h-5 text-emerald-600" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase font-display">Cloud Library</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Browse and download free community materials</p>
        </div>
        <button 
          onClick={onClose}
          className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-colors text-slate-400 hover:text-slate-600 shadow-sm"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Input 
            placeholder="Search cloud library..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        {isAdmin && (
          <Button
            variant="secondary"
            onClick={onSyncPublic}
            loading={isSyncing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-200 dark:shadow-none"
            leftIcon={<CloudUpload className="w-4 h-4" />}
          >
            Publish Local Content
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/50">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0", SUBJECTS.find(s => s.id === item.subject)?.color || "bg-emerald-500")}>
                    {SUBJECTS.find(s => s.id === item.subject)?.icon ? 
                      React.cloneElement(SUBJECTS.find(s => s.id === item.subject)!.icon as React.ReactElement<any>, { className: "w-6 h-6" }) :
                      <BookOpen className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                        {item.contentType}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-slate-100 truncate font-display uppercase text-sm">{item.topic}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{item.subject} • {item.grade}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDownload(item)}
                    className="shrink-0 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl"
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <CloudOff className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No materials found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm">
              {searchTerm ? "Try a different search term." : "The cloud library is currently empty. Check back later!"}
            </p>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/20 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-amber-900 dark:text-amber-100 uppercase tracking-tight">Admin Controls</h4>
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">You can publish all local offline content to the public cloud library for all users to download.</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function LibraryView({ items, drafts, activeTab, onTabChange, onOpen, onDelete, onOpenDraft, onDeleteDraft, onClose, onExport, onSync, syncing, lastSync, isOnline, onOpenCloud }: { 
  items: SavedMaterial[], 
  drafts: Draft[],
  activeTab: 'saved' | 'drafts' | 'guides' | 'flashcards' | 'papers' | 'textbooks',
  onTabChange: (tab: 'saved' | 'drafts' | 'guides' | 'flashcards' | 'papers' | 'textbooks') => void,
  onOpen: (item: SavedMaterial) => void, 
  onDelete: (id: string) => void,
  onOpenDraft: (draft: Draft) => void,
  onDeleteDraft: (id: string) => void,
  onClose: () => void,
  onExport: () => void,
  onSync: () => void,
  syncing: boolean,
  lastSync: string | null,
  isOnline: boolean,
  onOpenCloud: () => void
}) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredItems = items.filter(item => 
    item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.contentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDrafts = drafts.filter(draft => 
    draft.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.contentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGuides = OFFLINE_GUIDES.filter(guide => 
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFlashcards = OFFLINE_FLASHCARDS.filter(fc => 
    fc.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fc.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPapers = OFFLINE_PAPERS.filter(paper => 
    paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paper.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paper.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTextbooks = OFFLINE_TEXTBOOKS.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'saved', label: 'Saved', icon: <Download className="w-4 h-4" />, color: "text-emerald-500" },
    { id: 'drafts', label: 'Drafts', icon: <PenTool className="w-4 h-4" />, color: "text-amber-500" },
    { id: 'guides', label: 'Guides', icon: <BookOpen className="w-4 h-4" />, color: "text-blue-500" },
    { id: 'flashcards', label: 'Revision', icon: <Layers className="w-4 h-4" />, color: "text-purple-500" },
    { id: 'papers', label: 'Papers', icon: <FileText className="w-4 h-4" />, color: "text-indigo-500" },
    { id: 'textbooks', label: 'Books', icon: <Book className="w-4 h-4" />, color: "text-rose-500" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-emerald-500 rounded-full" />
            <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tighter uppercase font-display">Your Library</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm ml-5">Manage your personalized study collection</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center -space-x-2 mr-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="User" referrerPolicy="no-referrer" />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white">
              +{items.length + drafts.length}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCloud}
            className="bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-xl px-4 font-black uppercase tracking-widest text-[10px]"
            leftIcon={<Cloud className="w-4 h-4" />}
          >
            Cloud Library
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSync}
            disabled={!isOnline || syncing}
            loading={syncing}
            className="bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-xl px-4 font-black uppercase tracking-widest text-[10px]"
            leftIcon={syncing ? null : <RefreshCw className="w-4 h-4" />}
          >
            {syncing ? "Syncing..." : "Sync Cloud"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
        <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-6 flex items-center gap-4 group hover:bg-emerald-500/10 transition-all cursor-pointer">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{items.length}</div>
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Saved Materials</div>
          </div>
        </div>
        <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-6 flex items-center gap-4 group hover:bg-amber-500/10 transition-all cursor-pointer">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
            <PenTool className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{drafts.length}</div>
            <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Active Drafts</div>
          </div>
        </div>
        <div className="bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 rounded-[2rem] p-6 flex items-center gap-4 group hover:bg-purple-500/10 transition-all cursor-pointer">
          <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{OFFLINE_FLASHCARDS.length}</div>
            <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Revision Sets</div>
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="px-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recently Accessed</h3>
            <button className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
            {items.slice(0, 5).map((item) => (
              <motion.div
                key={`recent-${item.id}`}
                whileHover={{ y: -4 }}
                onClick={() => onOpen(item)}
                className="min-w-[280px] bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0", SUBJECTS.find(s => s.id === item.subject)?.color || "bg-emerald-500")}>
                  {SUBJECTS.find(s => s.id === item.subject)?.icon ? 
                    React.cloneElement(SUBJECTS.find(s => s.id === item.subject)!.icon as React.ReactElement<any>, { className: "w-6 h-6" }) :
                    <BookOpen className="w-6 h-6" />}
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm truncate uppercase tracking-tight">{item.topic}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.subject}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl py-4 px-4 -mx-4 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="flex p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as any)}
                className={cn(
                  "relative px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0",
                  activeTab === tab.id ? tab.color : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="library-tab-active"
                    className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-inner"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-md text-[8px] font-black",
                    activeTab === tab.id ? "bg-white dark:bg-slate-700 shadow-sm" : "bg-slate-100 dark:bg-slate-800"
                  )}>
                    {tab.id === 'saved' ? items.length : tab.id === 'drafts' ? drafts.length : tab.id === 'guides' ? OFFLINE_GUIDES.length : tab.id === 'flashcards' ? OFFLINE_FLASHCARDS.length : tab.id === 'papers' ? OFFLINE_PAPERS.length : OFFLINE_TEXTBOOKS.length}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <div className="relative flex-1 w-full">
            <Input 
              placeholder={`Search in ${tabs.find(t => t.id === activeTab)?.label}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl h-12 shadow-sm"
            />
          </div>
        </div>
      </div>

      {activeTab === 'textbooks' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTextbooks.map((book) => (
            <motion.div
              layout
              key={book.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              onClick={() => onOpen({
                id: book.id,
                subject: book.subject as Subject,
                level: 'O-Level',
                grade: 'Form 4',
                contentType: 'Textbook Chapter',
                topic: book.topic,
                content: book.content,
                generatedImage: null,
                timestamp: Date.now()
              })}
              className="group bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md", SUBJECTS.find(s => s.id === book.subject)?.color || "bg-rose-500")}>
                  {SUBJECTS.find(s => s.id === book.subject)?.icon ? 
                    React.cloneElement(SUBJECTS.find(s => s.id === book.subject)!.icon as React.ReactElement<any>, { className: "w-5 h-5" }) :
                    <Book className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{book.title}</h4>
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{book.subject} • {book.topic}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{book.description}</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Shield className="w-3 h-3" />
                Always Available Offline
              </div>
            </motion.div>
          ))}
        </div>
      ) : activeTab === 'papers' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map((paper) => (
            <motion.div
              layout
              key={paper.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              onClick={() => onOpen({
                id: paper.id,
                subject: paper.subject as Subject,
                level: 'O-Level',
                grade: 'Form 4',
                contentType: 'Practice Paper',
                topic: paper.topic,
                content: paper.content,
                generatedImage: null,
                timestamp: Date.now()
              })}
              className="group bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md", SUBJECTS.find(s => s.id === paper.subject)?.color || "bg-blue-500")}>
                  {SUBJECTS.find(s => s.id === paper.subject)?.icon ? 
                    React.cloneElement(SUBJECTS.find(s => s.id === paper.subject)!.icon as React.ReactElement<any>, { className: "w-5 h-5" }) :
                    <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{paper.title}</h4>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{paper.subject} • {paper.topic}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{paper.description}</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Shield className="w-3 h-3" />
                Always Available Offline
              </div>
            </motion.div>
          ))}
        </div>
      ) : activeTab === 'flashcards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlashcards.map((fc) => (
            <motion.div
              layout
              key={fc.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              onClick={() => onOpen({
                id: fc.id,
                subject: fc.subject as Subject,
                level: 'O-Level',
                grade: 'Form 4',
                contentType: 'Flashcards',
                topic: fc.topic,
                content: fc.cards,
                generatedImage: null,
                timestamp: Date.now()
              })}
              className="group bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md", SUBJECTS.find(s => s.id === fc.subject)?.color || "bg-amber-500")}>
                  {SUBJECTS.find(s => s.id === fc.subject)?.icon ? 
                    React.cloneElement(SUBJECTS.find(s => s.id === fc.subject)!.icon as React.ReactElement<any>, { className: "w-5 h-5" }) :
                    <Layers className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{fc.topic}</h4>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{fc.subject} • {fc.cards.length} Cards</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">Quick revision cards for {fc.topic}. Always available offline.</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Shield className="w-3 h-3" />
                Always Available Offline
              </div>
            </motion.div>
          ))}
        </div>
      ) : activeTab === 'guides' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuides.map((guide) => (
            <motion.div
              layout
              key={guide.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              onClick={() => onOpen({
                id: guide.id,
                subject: guide.subject as Subject,
                level: 'O-Level',
                grade: 'Form 4',
                contentType: 'Notes',
                topic: guide.topic,
                content: guide.content,
                generatedImage: null,
                timestamp: Date.now()
              })}
              className="group bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md", SUBJECTS.find(s => s.id === guide.subject)?.color || "bg-emerald-500")}>
                  {SUBJECTS.find(s => s.id === guide.subject)?.icon ? 
                    React.cloneElement(SUBJECTS.find(s => s.id === guide.subject)!.icon as React.ReactElement<any>, { className: "w-5 h-5" }) :
                    <BookOpen className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{guide.title}</h4>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{guide.subject} • {guide.topic}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{guide.description}</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Shield className="w-3 h-3" />
                Always Available Offline
              </div>
            </motion.div>
          ))}
        </div>
      ) : activeTab === 'saved' ? (
        filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  onClick={() => onOpen(item)}
                  className="group bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-start gap-4 mb-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", SUBJECTS.find(s => s.id === item.subject)?.color || "bg-emerald-500")}>
                      {SUBJECTS.find(s => s.id === item.subject)?.icon ? 
                        React.cloneElement(SUBJECTS.find(s => s.id === item.subject)!.icon as React.ReactElement<any>, { className: "w-6 h-6" }) :
                        (item.contentType === "Quiz" ? <BrainCircuit className="w-6 h-6" /> : 
                         item.contentType === "Flashcards" ? <StickyNote className="w-6 h-6" /> : 
                         <BookOpen className="w-6 h-6" />)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                          {item.contentType}
                        </span>
                        {item.difficulty && (
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                            item.difficulty === "Easy" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" :
                            item.difficulty === "Medium" ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20" :
                            "text-red-600 bg-red-50 dark:bg-red-900/20"
                          )}>
                            {item.difficulty}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-400">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 dark:text-slate-100 truncate pr-8 font-display uppercase text-sm">{item.topic}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{item.subject} • {item.grade}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ready to Study</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState 
            searchTerm={searchTerm} 
            onClose={onClose} 
            type="saved" 
          />
        )
      ) : (
        filteredDrafts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredDrafts.map((draft) => (
                <motion.div
                  layout
                  key={draft.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  onClick={() => onOpenDraft(draft)}
                  className="group bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-500 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDraft(draft.id);
                      }}
                      className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-start gap-4 mb-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", SUBJECTS.find(s => s.id === draft.subject)?.color || "bg-amber-500")}>
                      {SUBJECTS.find(s => s.id === draft.subject)?.icon ? 
                        React.cloneElement(SUBJECTS.find(s => s.id === draft.subject)!.icon as React.ReactElement<any>, { className: "w-6 h-6" }) :
                        <PenTool className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md">
                          Draft
                        </span>
                        {draft.difficulty && (
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                            draft.difficulty === "Easy" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" :
                            draft.difficulty === "Medium" ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20" :
                            "text-red-600 bg-red-50 dark:bg-red-900/20"
                          )}>
                            {draft.difficulty}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-400">
                          {new Date(draft.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 dark:text-slate-100 truncate pr-8 font-display uppercase text-sm">{draft.topic}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{draft.subject} • {draft.grade}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unfinished Work</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState searchTerm={searchTerm} onClose={onClose} type="drafts" />
        )
      )}
    </motion.div>
  );
}

function EmptyState({ searchTerm, onClose, type }: { 
  searchTerm: string, 
  onClose: () => void, 
  type: 'saved' | 'drafts'
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-inner"
    >
      <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          {type === 'saved' ? <Download className="w-12 h-12 text-slate-300 dark:text-slate-600" /> : <PenTool className="w-12 h-12 text-slate-300 dark:text-slate-600" />}
        </motion.div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
          <Search className="w-4 h-4" />
        </div>
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-tighter font-display">
        {searchTerm ? "No matches found" : type === 'saved' ? "Your library is empty" : "No drafts found"}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm font-medium leading-relaxed mb-10">
        {searchTerm ? "Try searching for a different subject or topic." : type === 'saved' ? "Generate some study materials and save them to access them here anytime." : "You can save your notes and essay inputs as drafts to continue later."}
      </p>
      {!searchTerm && (
        <div className="flex flex-col items-center gap-4">
          <Button 
            onClick={onClose}
            className="px-10 py-4 h-auto rounded-2xl shadow-xl shadow-emerald-500/20"
          >
            {type === 'saved' ? "Start Generating" : "Start Writing"}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
