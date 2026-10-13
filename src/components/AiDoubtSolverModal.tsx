import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  X,
  Sparkles,
  Send,
  Mic,
  BookOpen,
  AlertTriangle,
  Play,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Plus,
  Atom,
  Calculator,
  FlaskConical,
  Dna,
  Terminal,
  FileQuestion,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SolvedDoubt, UserProfile } from '../types';
import { playSound, fireCelebrationConfetti } from '../utils/gameLogic';

interface AiDoubtSolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  savedDoubts: SolvedDoubt[];
  onSaveDoubt: (doubt: SolvedDoubt) => void;
  onStartFocus: (title: string, duration?: number) => void;
  onConvertDoubtToMission: (title: string, subject: string) => void;
}

export const AiDoubtSolverModal: React.FC<AiDoubtSolverModalProps> = ({
  isOpen,
  onClose,
  profile,
  savedDoubts,
  onSaveDoubt,
  onStartFocus,
  onConvertDoubtToMission,
}) => {
  const [activeTab, setActiveTab] = useState<'solve' | 'history'>('solve');
  const [selectedSubject, setSelectedSubject] = useState<string>('Physics');
  const [selectedLevel, setSelectedLevel] = useState<string>('JEE Main & Boards');
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSolution, setCurrentSolution] = useState<SolvedDoubt | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showPracticeAnswer, setShowPracticeAnswer] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Subject options
  const subjects = [
    { id: 'Physics', label: 'Physics', icon: Atom },
    { id: 'Mathematics', label: 'Maths', icon: Calculator },
    { id: 'Chemistry', label: 'Chemistry', icon: FlaskConical },
    { id: 'Biology', label: 'Biology', icon: Dna },
    { id: 'Computer Science', label: 'CS & Coding', icon: Terminal },
    { id: 'General Studies', label: 'All / Other', icon: FileQuestion },
  ];

  // Quick preset questions per subject
  const presetQuestions: Record<string, string[]> = {
    Physics: [
      'Why does torque depend on the chosen origin or axis of rotation?',
      'How to derive drift velocity and deduce Ohm’s law microscopic form?',
      'Explain rolling without slipping on an inclined plane with friction.',
    ],
    Mathematics: [
      'Explain King’s property in definite integrals with a step-by-step proof.',
      'How do you determine if a matrix is invertible using row reduction?',
      'Explain the geometric interpretation of Lagrange Mean Value Theorem.',
    ],
    Chemistry: [
      'How to differentiate between SN1 and SN2 reaction mechanisms?',
      'Why is bond angle in NH3 less than tetrahedral 109.5 degrees?',
      'Explain Cannizzaro reaction mechanism and why aldehydes with no alpha-H undergo it.',
    ],
    Biology: [
      'Explain Meselson & Stahl experiment proving semi-conservative DNA replication.',
      'What is the difference between Mitosis and Meiosis II in cell division?',
      'Explain the sliding filament mechanism of muscle contraction.',
    ],
    'Computer Science': [
      'Explain Binary Search logic, time complexity, and how to avoid integer overflow.',
      'What is the difference between DFS and BFS in graph traversals?',
      'Explain dynamic programming memoization vs tabulation with Fibonacci.',
    ],
    'General Studies': [
      'Explain first-principles problem solving and how to break down complex questions.',
      'What are the standard steps in writing a high-scoring analytical exam answer?',
    ],
  };

  // Initialize Speech Recognition for doubt dictation
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuestion((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your doubt question.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        playSound('click');
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSolveDoubt = async (e?: React.FormEvent, customQ?: string) => {
    if (e) e.preventDefault();
    const queryToUse = customQ || question;
    if (!queryToUse.trim()) return;

    setIsLoading(true);
    setCurrentSolution(null);
    setShowPracticeAnswer(false);
    setBookmarked(false);
    playSound('click');

    try {
      const response = await fetch('/api/ai/solve-doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          doubtText: queryToUse.trim(),
          level: selectedLevel,
          studentName: profile.name,
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const solutionData: SolvedDoubt = {
          id: `doubt_${Date.now()}`,
          subject: resData.data.subject || selectedSubject,
          topic: resData.data.topic || 'Concept Explanation',
          question: queryToUse.trim(),
          level: selectedLevel,
          coreConcept: resData.data.coreConcept,
          stepByStepSolution: resData.data.stepByStepSolution || [],
          finalAnswer: resData.data.finalAnswer,
          commonExamTrap: resData.data.commonExamTrap,
          quickPracticeQuestion: resData.data.quickPracticeQuestion,
          createdAt: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        setCurrentSolution(solutionData);
        onSaveDoubt(solutionData);
        playSound('stage_clear');
        fireCelebrationConfetti();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative my-6 text-left max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[2px] flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-white tracking-tight">
                  All-Subject AI Doubt Solver
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  INSTANT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Step-by-step conceptual derivations, formula mastery, & negative marking warnings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            aria-label="Close Doubt Solver"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Switcher: Ask New Doubt vs Doubt Notebook History */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => {
                playSound('click');
                setActiveTab('solve');
              }}
              className={`px-3 py-1 font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'solve'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ask Doubt
            </button>
            <button
              onClick={() => {
                playSound('click');
                setActiveTab('history');
              }}
              className={`px-3 py-1 font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Doubt Notebook ({savedDoubts.length})</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:block">
            Target: <span className="text-slate-300 font-semibold">{profile.targetExam}</span>
          </div>
        </div>

        {/* TAB 1: SOLVE NEW DOUBT */}
        {activeTab === 'solve' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Subject Selector Buttons */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                SELECT SUBJECT
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {subjects.map((sub) => {
                  const Icon = sub.icon;
                  const isSelected = selectedSubject === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setSelectedSubject(sub.id);
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-md shadow-purple-950/40'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[11px]">{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Difficulty Level */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  TARGET EXAM BENCHMARK
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="CBSE & State Board Examinations">Board Examinations (CBSE/ICSE/State)</option>
                  <option value="JEE Main & Standard Competitive">JEE Main & CET</option>
                  <option value="JEE Advanced & High Rigor">JEE Advanced (Deep Rigor)</option>
                  <option value="NEET Medical UG Examination">NEET UG (Medical)</option>
                  <option value="College & Engineering Degree">College / Higher Studies</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  INPUT MODE
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse border-rose-500'
                        : 'bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
                  </button>
                  {question && (
                    <button
                      type="button"
                      onClick={() => setQuestion('')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Question Textarea */}
            <form onSubmit={handleSolveDoubt} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  YOUR QUESTION / FORMULA / NUMERICAL
                </label>
                <textarea
                  rows={3}
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={`Type or speak any ${selectedSubject} doubt statement, formula derivation, or conceptual confusion...`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              {/* Preset doubt chips */}
              {presetQuestions[selectedSubject] && (
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">
                    Or tap a classic {selectedSubject} doubt question:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {presetQuestions[selectedSubject].map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setQuestion(q);
                          handleSolveDoubt(undefined, q);
                        }}
                        className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer text-left"
                      >
                        "{q}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !question.trim()}
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoading ? 'Solving with Academic Rigor...' : 'Solve Doubt Step-by-Step'}</span>
              </button>
            </form>

            {/* SOLUTION DISPLAY */}
            {currentSolution && (
              <div className="space-y-3 pt-3 border-t border-slate-800/80 animate-in fade-in duration-300">
                {/* Topic Header & Bookmark action */}
                <div className="flex items-center justify-between bg-purple-950/30 border border-purple-500/40 rounded-2xl p-3.5">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-extrabold text-purple-300">{currentSolution.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-300 font-medium">{currentSolution.topic}</span>
                    </div>
                    <p className="text-xs text-slate-400 italic mt-0.5 line-clamp-1">
                      "{currentSolution.question}"
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setBookmarked(!bookmarked);
                        playSound('click');
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 text-purple-300 hover:text-white cursor-pointer"
                      title="Bookmark to Notebook"
                    >
                      {bookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 1. Core Concept Card */}
                <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800">
                  <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider block mb-1">
                    CORE PRINCIPLE & GOVERNING FORMULA
                  </span>
                  <p className="text-xs text-white font-medium leading-relaxed">
                    {currentSolution.coreConcept}
                  </p>
                </div>

                {/* 2. Step-by-Step Breakdown */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block">
                    STEP-BY-STEP DERIVATION & SOLUTION
                  </span>

                  {currentSolution.stepByStepSolution.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                          {step.stepNumber}
                        </span>
                        <h4 className="font-bold text-slate-200">{step.title}</h4>
                      </div>
                      <p className="text-slate-300 leading-relaxed pl-7 text-[11px]">
                        {step.explanation}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 3. Final Answer / Takeaway */}
                <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-3.5 text-xs">
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block mb-0.5">
                    FINAL CONCLUSION / VALUE
                  </span>
                  <p className="text-slate-100 font-bold">{currentSolution.finalAnswer}</p>
                </div>

                {/* 4. Common Exam Trap Callout */}
                <div className="bg-rose-950/25 border border-rose-500/40 rounded-2xl p-3.5 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-extrabold text-rose-300 uppercase tracking-wider block">
                      COMMON EXAM PITFALL / NEGATIVE MARKING TRAP
                    </span>
                    <p className="text-rose-200/90 mt-0.5 leading-relaxed text-[11px]">
                      {currentSolution.commonExamTrap}
                    </p>
                  </div>
                </div>

                {/* 5. Quick Retention Drill */}
                {currentSolution.quickPracticeQuestion && (
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
                    <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block mb-1">
                      RETENTION DRILL QUESTION
                    </span>
                    <p className="text-slate-300 text-[11px] mb-2">
                      {currentSolution.quickPracticeQuestion}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowPracticeAnswer(!showPracticeAnswer)}
                      className="text-[11px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      {showPracticeAnswer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPracticeAnswer ? 'Hide Hint' : 'Show Solution Hint'}</span>
                    </button>
                    {showPracticeAnswer && (
                      <p className="text-[11px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-800">
                        💡 Apply the formula derived in Step 2 directly to eliminate intermediate terms.
                      </p>
                    )}
                  </div>
                )}

                {/* Action Handlers: Turn into Focus Sprint or Mission */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      playSound('click');
                      onStartFocus(`${currentSolution.subject}: ${currentSolution.topic}`, 30);
                      onClose();
                    }}
                    className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Practice in Focus Mode (30m)</span>
                  </button>

                  <button
                    onClick={() => {
                      playSound('complete');
                      onConvertDoubtToMission(
                        `Master ${currentSolution.topic} (${currentSolution.subject})`,
                        currentSolution.subject
                      );
                      onClose();
                    }}
                    className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add as Daily Mission (+25 XP)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DOUBT NOTEBOOK HISTORY */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {savedDoubts.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800">
                <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-300">Doubt Notebook is empty</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Every doubt you solve will be saved here so you can review before examination day.
                </p>
              </div>
            ) : (
              savedDoubts.map((doubt) => (
                <div
                  key={doubt.id}
                  onClick={() => {
                    setCurrentSolution(doubt);
                    setActiveTab('solve');
                    setQuestion(doubt.question);
                  }}
                  className="p-3.5 bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-purple-500/50 rounded-2xl cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 font-semibold text-purple-300">
                      <span>{doubt.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span>{doubt.topic}</span>
                    </div>
                    <span>{doubt.createdAt}</span>
                  </div>

                  <h3 className="text-xs font-bold text-white line-clamp-2">
                    {doubt.question}
                  </h3>

                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    Takeaway: {doubt.finalAnswer}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
