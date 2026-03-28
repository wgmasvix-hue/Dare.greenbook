import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  BrainCircuit, 
  GraduationCap, 
  History, 
  Calculator, 
  FlaskConical, 
  Languages, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  Bell,
  BellOff,
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
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { Input } from './components/ui/Input';
import { generateExamContent, suggestTopics, generateImage, generateAudioExplanation, testConnection } from './services/gemini';
import { Subject, Level, Grade, ContentType, Flashcard, QuizQuestion, SavedMaterial } from './types';

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

const SUBJECTS: { id: Subject; icon: React.ReactNode; color: string }[] = [
  { id: "Mathematics", icon: <Calculator className="w-6 h-6" />, color: "bg-blue-500" },
  { id: "Grade 7 Mathematics", icon: <Calculator className="w-6 h-6" />, color: "bg-indigo-500" },
  { id: "English Language", icon: <Languages className="w-6 h-6" />, color: "bg-orange-500" },
  { id: "Biology", icon: <FlaskConical className="w-6 h-6" />, color: "bg-green-500" },
  { id: "Chemistry", icon: <FlaskConical className="w-6 h-6" />, color: "bg-purple-500" },
  { id: "Physics", icon: <FlaskConical className="w-6 h-6" />, color: "bg-cyan-500" },
  { id: "History", icon: <History className="w-6 h-6" />, color: "bg-amber-600" },
  { id: "Heritage-Based Curriculum", icon: <GraduationCap className="w-6 h-6" />, color: "bg-emerald-600" },
  { id: "Indigenous Languages", icon: <Languages className="w-6 h-6" />, color: "bg-rose-500" },
  { id: "Additional Mathematics", icon: <Calculator className="w-6 h-6" />, color: "bg-blue-700" },
  { id: "Agriculture", icon: <Trees className="w-6 h-6" />, color: "bg-green-700" },
  { id: "Arts", icon: <Palette className="w-6 h-6" />, color: "bg-pink-500" },
  { id: "Commerce", icon: <Briefcase className="w-6 h-6" />, color: "bg-slate-700" },
  { id: "Commercial Studies", icon: <Briefcase className="w-6 h-6" />, color: "bg-slate-600" },
  { id: "Computer Science", icon: <Monitor className="w-6 h-6" />, color: "bg-indigo-600" },
  { id: "Home Management and Design", icon: <Utensils className="w-6 h-6" />, color: "bg-orange-400" },
  { id: "Literature in English", icon: <Book className="w-6 h-6" />, color: "bg-blue-400" },
  { id: "Literature in Indigenous Languages", icon: <Book className="w-6 h-6" />, color: "bg-rose-400" },
  { id: "Business Enterprise and Skills", icon: <TrendingUp className="w-6 h-6" />, color: "bg-emerald-700" },
  { id: "Dance", icon: <Music2 className="w-6 h-6" />, color: "bg-purple-400" },
  { id: "Design and Technology", icon: <PenTool className="w-6 h-6" />, color: "bg-slate-500" },
  { id: "Economic History", icon: <Landmark className="w-6 h-6" />, color: "bg-amber-700" },
  { id: "Economics", icon: <TrendingUp className="w-6 h-6" />, color: "bg-emerald-500" },
  { id: "Food Technology & Design", icon: <Utensils className="w-6 h-6" />, color: "bg-orange-600" },
  { id: "Foreign Languages", icon: <Languages className="w-6 h-6" />, color: "bg-violet-500" },
  { id: "Accounting", icon: <PieChartIcon className="w-6 h-6" />, color: "bg-blue-600" },
  { id: "Geography", icon: <Globe className="w-6 h-6" />, color: "bg-sky-600" },
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
  { id: "Combined Science", icon: <Stethoscope className="w-6 h-6" />, color: "bg-emerald-400" },
  { id: "Visual and Performing Arts", icon: <Palette className="w-6 h-6" />, color: "bg-pink-400" },
  { id: "Mass Displays", icon: <Layout className="w-6 h-6" />, color: "bg-blue-400" },
  { id: "Mathematics and Science", icon: <Calculator className="w-6 h-6" />, color: "bg-indigo-400" },
  { id: "Family and Heritage Studies", icon: <Users className="w-6 h-6" />, color: "bg-amber-500" },
  { id: "Information and Communication Technology", icon: <Monitor className="w-6 h-6" />, color: "bg-cyan-600" },
  { id: "Shona", icon: <Languages className="w-6 h-6" />, color: "bg-rose-500" },
  { id: "Ndebele", icon: <Languages className="w-6 h-6" />, color: "bg-rose-600" },
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
  { id: "Business Studies", icon: <Briefcase className="w-6 h-6" />, color: "bg-slate-700" },
  { id: "Mechanical Mathematics", icon: <Calculator className="w-6 h-6" />, color: "bg-blue-900" },
  { id: "Horticulture", icon: <Sprout className="w-6 h-6" />, color: "bg-green-500" },
  { id: "Business Enterprise", icon: <TrendingUp className="w-6 h-6" />, color: "bg-emerald-600" },
];

const CONTENT_TYPES: { id: ContentType; label: string; description: string; premium?: boolean }[] = [
  { id: "Practice Paper", label: "Practice Paper", description: "Full exam-style question sets" },
  { id: "Exam Paper", label: "Exam Paper", description: "Full-length exam paper with MCQs, short answers, and essays", premium: true },
  { id: "Quiz", label: "Interactive Quiz", description: "Quick 5-10 multiple choice questions" },
  { id: "Flashcards", label: "Flashcards", description: "Bite-sized revision cards" },
  { id: "Explanations", label: "Explanations", description: "Step-by-step topic breakdowns", premium: true },
  { id: "Textbook Chapter", label: "Textbook Chapter", description: "Comprehensive Zimbabwean textbook-style content with heritage links", premium: true },
  { id: "Syllabus Guide", label: "Syllabus Guide", description: "ZIMSEC syllabus overview & key topics" },
  { id: "Feedback", label: "Essay Feedback", description: "Get notes on your written work" },
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
      className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Quote className="w-24 h-24 text-emerald-600" />
      </div>
      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600">
          <Quote className="w-6 h-6" />
        </div>
        <div className="max-w-2xl">
          <p className="text-lg sm:text-xl font-medium text-slate-700 dark:text-slate-300 italic leading-relaxed">
            "{quote.text}"
          </p>
          <div className="mt-4 flex flex-col items-center">
            <div className="flex items-center gap-4">
              <p className="font-black text-emerald-600 uppercase tracking-widest text-xs">— {quote.author}</p>
              <Button 
                variant="ghost"
                size="icon"
                onClick={refreshQuote}
                className="rounded-lg text-slate-400 hover:text-emerald-500"
                title="New Inspiration"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
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

export default function App() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isReaderMode, setIsReaderMode] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [subject, setSubject] = useState<Subject | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const autoLogin = async () => {
      if (!isConfigured) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email: 'wgmasvix@gmail.com',
            password: '2126'
          });
          if (error) {
            console.warn('Auto-login failed (likely user not found):', error.message);
          }
        } catch (err) {
          console.error('Auto-login failed:', err);
        }
      }
    };
    autoLogin();
  }, []);

  useEffect(() => {
    if (user) {
      syncLibraryWithSupabase();
    }
  }, [user]);

  const syncLibraryWithSupabase = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('saved_materials')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      if (data) {
        // Merge with local library, avoiding duplicates
        setLibrary(prev => {
          const combined = [...data, ...prev];
          const seen = new Set();
          return combined.filter(item => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
        });
      }
    } catch (error) {
      console.error('Error syncing with Supabase:', error);
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
  const [showLibrary, setShowLibrary] = useState(false);

  useEffect(() => {
    localStorage.setItem('library', JSON.stringify(library));
  }, [library]);

  const handleSaveToLibrary = async () => {
    if (!user) {
      setAuthMode('login');
      setShowAuth(true);
      return;
    }
    if (!subject || !contentType || !result) return;
    
    const newMaterial: SavedMaterial = {
      id: crypto.randomUUID(),
      subject,
      level,
      grade,
      contentType,
      topic: topic || studentInput || "General",
      content: result,
      generatedImage,
      audioUrl: audioUrl,
      timestamp: Date.now()
    };
    
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
    setTopic(item.topic);
    setResult(item.content);
    setGeneratedImage(item.generatedImage);
    setShowLibrary(false);
    setStep(3);
  };
  const [level, setLevel] = useState<Level>("O-Level");
  const [grade, setGrade] = useState<Grade>("Form 4");
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [topic, setTopic] = useState("");
  const [topicSearch, setTopicSearch] = useState("");
  const [contentSearch, setContentSearch] = useState("");
  const [studentInput, setStudentInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [textbooks, setTextbooks] = useState<{ name: string; url: string }[]>([]);
  const [selectedTextbook, setSelectedTextbook] = useState<string | null>(null);
  const [verifyWithTextbook, setVerifyWithTextbook] = useState(false);
  const [loadingTextbook, setLoadingTextbook] = useState(false);
  const [verifiedBy, setVerifiedBy] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [streak, setStreak] = useState(1);
  const [reminders, setReminders] = useState<{ id: string; time: string; days: string[] }[]>([]);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
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
      if (!isConfigured) return;
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
        }
      } catch (err) {
        console.error('Error fetching textbooks:', err);
      }
    };
    fetchTextbooks();
  }, []);

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
        topic,
        studentInput,
        image: image || undefined,
        referenceContent
      });
      setResult(data);

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

  const handleLogout = async () => {
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
    if (!user) {
      setAuthMode('login');
      setShowAuth(true);
      return;
    }
    if (!result) return;
    setGeneratingAudio(true);
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
      }
    } catch (error) {
      console.error('Audio generation failed:', error);
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
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div 
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all",
                  step === s.id 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : step > s.id 
                      ? "text-emerald-600 dark:text-emerald-400" 
                      : "text-slate-400 dark:text-slate-600"
                )}
              >
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Configuration Warning */}
      {!isConfigured && (
        <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1 text-center sticky top-0 z-[60] flex items-center justify-center gap-2">
          <AlertTriangle className="w-3 h-3" />
          Backend Not Configured - Login & Sync Disabled
          <AlertTriangle className="w-3 h-3" />
        </div>
      )}

      {!hasApiKey && (
        <div className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1 text-center sticky top-0 z-[60] flex items-center justify-center gap-3">
          <Zap className="w-3 h-3 animate-pulse" />
          Gemini API Key Required
          <button 
            onClick={handleOpenKeyDialog}
            className="bg-white text-blue-600 px-3 py-0.5 rounded-full font-black hover:bg-blue-50 transition-colors"
          >
            Setup Now
          </button>
          <Zap className="w-3 h-3 animate-pulse" />
        </div>
      )}
      
      {/* Background Blobs */}
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
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
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

            <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              <Button 
                variant={!showLibrary ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => { setShowLibrary(false); setStep(1); }}
                className="text-[10px] font-black uppercase tracking-widest h-8"
                leftIcon={<GraduationCap className="w-3.5 h-3.5" />}
              >
                Learn
              </Button>
              <Button 
                variant={showLibrary ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setShowLibrary(true)}
                className="text-[10px] font-black uppercase tracking-widest h-8"
                leftIcon={<History className="w-3.5 h-3.5" />}
              >
                Library
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
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

            <div className="bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
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
        {!showLibrary && step > 1 && <StepIndicator />}
        
        <div className="mb-6 flex items-center justify-between">
          {!showLibrary && step > 1 && (
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
          {showLibrary ? (
            <LibraryView 
              items={library} 
              onOpen={openFromLibrary} 
              onDelete={deleteFromLibrary} 
              onClose={() => setShowLibrary(false)} 
            />
          ) : step === 1 ? (
            <div className="space-y-12 py-4">
              <div className="relative rounded-[3rem] overflow-hidden aspect-[4/3] sm:aspect-[21/9] max-w-5xl mx-auto shadow-2xl group">
                <img 
                  src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&q=80&w=1200&h=800"
                  alt="Hero"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-8 sm:p-12">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="max-w-2xl"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-black text-white uppercase tracking-widest">New Curriculum</div>
                      <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest">2026 Updated</div>
                    </div>
                    <h2 className="text-4xl sm:text-7xl font-black text-white leading-none tracking-tighter uppercase font-display">
                      Master the <br />
                      <span className="text-emerald-400">Heritage-Based</span> <br />
                      Curriculum
                    </h2>
                    <p className="text-slate-300 mt-6 text-sm sm:text-base font-medium max-w-lg">
                      The ultimate study companion for Zimbabwean students. Generate practice papers, quizzes, and textbook chapters tailored to your level.
                    </p>
                  </motion.div>
                </div>
              </div>

              {library.length > 0 && (
                <div className="space-y-6 max-w-5xl mx-auto">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Continue Learning</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowLibrary(true)}
                      className="text-[10px] font-black text-emerald-600 uppercase tracking-widest"
                    >
                      View All
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {library.slice(0, 3).map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -5 }}
                        onClick={() => openFromLibrary(item)}
                        className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", SUBJECTS.find(s => s.id === item.subject)?.color)}>
                            {SUBJECTS.find(s => s.id === item.subject)?.icon && React.cloneElement(SUBJECTS.find(s => s.id === item.subject)!.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm truncate font-display uppercase">{item.subject}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{item.contentType}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.grade}</span>
                          <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-8 max-w-5xl mx-auto">
                <div className="text-center space-y-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Select Your Level</h3>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tighter uppercase font-display">Where are you studying?</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { id: "Infant", icon: <Trees className="w-6 h-6" />, color: "bg-emerald-500" },
                    { id: "Junior", icon: <Sprout className="w-6 h-6" />, color: "bg-green-500" },
                    { id: "Grade 7", icon: <GraduationCap className="w-6 h-6" />, color: "bg-indigo-500" },
                    { id: "O-Level", icon: <BookOpen className="w-6 h-6" />, color: "bg-blue-500" },
                    { id: "A-Level", icon: <BrainCircuit className="w-6 h-6" />, color: "bg-purple-500" }
                  ].map((l, i) => (
                    <motion.button
                      key={l.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setLevel(l.id as Level);
                        setGrade(GRADES_BY_LEVEL[l.id as Level][0]);
                        setStep(2);
                      }}
                      className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-emerald-500 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none group"
                    >
                      <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6", l.color)}>
                        {l.icon}
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-black text-slate-900 dark:text-slate-100 font-display uppercase">{l.id}</span>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Revision</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="pt-12 max-w-5xl mx-auto">
                <QuoteSection />
              </div>
            </div>
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
                
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start">
                  {GRADES_BY_LEVEL[level].map((g, idx) => (
                    <Button
                      key={`${g}-${idx}`}
                      variant={grade === g ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setGrade(g);
                        setSuggestedTopics([]);
                      }}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold h-auto min-h-0",
                        grade === g
                          ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      )}
                    >
                      {g}
                    </Button>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                }).map((s) => (
                  <Button
                    key={s.id}
                    variant="outline"
                    onClick={() => {
                      setSubject(s.id);
                      setSuggestedTopics([]);
                      setStep(3);
                    }}
                    className="group h-auto p-4 rounded-xl border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20 transition-all text-left flex items-center gap-3 bg-white dark:bg-slate-900"
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110", s.color)}>
                      {React.cloneElement(s.icon as React.ReactElement<any>, { className: "w-5 h-5" })}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm font-display">{s.id}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Practice & Revision</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700 group-hover:text-emerald-500 transition-colors" />
                  </Button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CONTENT_TYPES.map((ct) => (
                    <Button
                      key={ct.id}
                      variant={contentType === ct.id ? 'primary' : 'outline'}
                      onClick={() => setContentType(ct.id)}
                      className={cn(
                        "h-auto p-5 rounded-2xl border-2 text-left transition-all flex flex-col items-start gap-1 relative overflow-hidden",
                        contentType === ct.id 
                          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-inner" 
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-200"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 font-display">{ct.label}</h4>
                        {ct.premium && !user && (
                          <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                            <Lock className="w-2 h-2" />
                            Premium
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{ct.description}</p>
                    </Button>
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
                  <h3 className="font-bold text-slate-700 dark:text-slate-400 uppercase text-[10px] tracking-widest">Paste your essay/answer</h3>
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
                      className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors text-sm"
                    >
                      Try Again
                    </button>
                    <button 
                      onClick={async () => {
                        const ok = await testConnection();
                        if (ok) {
                          alert("Connection successful! The API is responding.");
                        } else {
                          alert("Connection failed. Please check your internet and GEMINI_API_KEY.");
                        }
                      }}
                      className="px-6 py-2 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm"
                    >
                      Check Connection
                    </button>
                  </div>
                </motion.div>
              )}

              <Button
                disabled={!contentType || loading || (verifyWithTextbook && !selectedTextbook)}
                onClick={handleGenerate}
                loading={loading}
                className="w-full py-3.5 text-base"
                leftIcon={!loading && <Sparkles className="w-4 h-4" />}
              >
                Generate Content
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
                    onClick={() => setStep(2)}
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
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <Button 
              variant={!isListView ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setIsListView(false)}
              className={cn("px-3 py-1 h-auto rounded-md text-xs font-bold transition-all", !isListView ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-600" : "text-slate-500")}
            >
              Deck
            </Button>
            <Button 
              variant={isListView ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setIsListView(true)}
              className={cn("px-3 py-1 h-auto rounded-md text-xs font-bold transition-all", isListView ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-600" : "text-slate-500")}
            >
              List
            </Button>
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

function LibraryView({ items, onOpen, onDelete, onClose }: { 
  items: SavedMaterial[], 
  onOpen: (item: SavedMaterial) => void, 
  onDelete: (id: string) => void,
  onClose: () => void
}) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredItems = items.filter(item => 
    item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.contentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Downloads for offline reading</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Your saved materials for offline revision</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Input 
            placeholder="Search your library..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <Card 
              layout
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group p-6 rounded-[2rem] hover:shadow-xl hover:border-emerald-500 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="p-2 h-auto text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                />
              </div>

              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                  {item.contentType === "Quiz" ? <BrainCircuit className="w-6 h-6" /> : 
                   item.contentType === "Flashcards" ? <StickyNote className="w-6 h-6" /> : 
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
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate pr-8">{item.topic}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.subject} • {item.grade}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => onOpen(item)}
                  className="flex-1 py-3 h-auto bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Open Material
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Download className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {searchTerm ? "No matches found" : "Your downloads are empty"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {searchTerm ? "Try searching for a different subject or topic." : "Generate some study materials and save them to access them here anytime."}
          </p>
          {!searchTerm && (
            <Button 
              onClick={onClose}
              className="mt-8 px-8 py-3 h-auto"
            >
              Start Generating
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
