"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Lock, 
  User, 
  History, 
  Award, 
  BookOpen, 
  Sparkles, 
  Timer, 
  ChevronRight, 
  ArrowLeft, 
  RotateCcw, 
  Trash2, 
  Check, 
  ListTodo, 
  Volume2, 
  Search, 
  Plus, 
  Minus,
  Sparkle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QUESTIONS, Question, SubQuestion } from "@/lib/questions";
import { evaluateAnswer, EvaluationResult, cleanString, stripDiacritics, getLevenshteinDistance } from "@/lib/evaluator";
import Fireworks from "@/components/Fireworks";

// Helper to construct pre-filled templates for questions
function getQuestionInputTemplate(q: Question): string {
  const circles = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];
  return q.subQuestions.map((sq, idx) => {
    const label = sq.label.trim();
    const circle = circles[idx] || "①";
    
    // For questions 1-10, textbox only contains circles as requested: "Câu 1-10 phần textbox trả lời chỉ có các số thôi"
    if (q.id <= 10) {
      return circle + " ";
    }
    
    // Check if the label ends with a colon or has typical dictionary definition patterns
    const hasColon = label.includes(":") || label.includes("：");
    if (hasColon && label.length < 35) {
      // Use clean label with formatting if short (e.g. "① Israel:")
      return label;
    } else {
      // Just return the circle number so user can write next to it (e.g. "① ")
      return circle + " ";
    }
  }).join("\n");
}

// Helper to parse the consolidated text area into subparts
function parseCombinedAnswers(combinedText: string, q: Question): Record<string, string> {
  const result: Record<string, string> = {};
  const text = combinedText || "";
  const circles = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

  q.subQuestions.forEach((sq, idx) => {
    const currentCircle = circles[idx] || "①";
    const nextCircle = circles[idx + 1];

    const startIdx = text.indexOf(currentCircle);
    if (startIdx === -1) {
      result[sq.id] = "";
      return;
    }

    let contentStart = startIdx + currentCircle.length;

    // Check if the label is part of the string (e.g., "Israel:") and skip it
    const labelWithoutCircle = sq.label.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").trim();
    if (labelWithoutCircle) {
      const prefixIdx = text.indexOf(labelWithoutCircle, startIdx);
      if (prefixIdx !== -1 && prefixIdx < startIdx + 45) {
        contentStart = prefixIdx + labelWithoutCircle.length;
      }
    }

    let endIdx = text.length;
    if (nextCircle) {
      const nextIdx = text.indexOf(nextCircle, contentStart);
      if (nextIdx !== -1) {
        endIdx = nextIdx;
      }
    }

    let parsedVal = text.substring(contentStart, endIdx).trim();
    // Clean leading punctuation colons, spaces
    parsedVal = parsedVal.replace(/^[:：\s-]+/, "").trim();

    result[sq.id] = parsedVal;
  });

  return result;
}

// Help analyze incorrect user answers to determine missing keywords or typos
function analyzeMistakes(user: string, expected: string): string {
  if (!user || !user.trim()) {
    return "Thiếu toàn bộ câu trả lời.";
  }

  // Common particles to ignore for unrelated wrong words
  const ignoreWrong = [
    "va", "la", "de", "boi", "cho", "cua", "khi", "co", "se", "da", "ra", "di", "voi", "tu", "nhu", "nao", "ai", "co", "thi", "ma", "o"
  ];

  // Helper to split string into raw words without punctuation
  const getRawWords = (str: string) => {
    return str
      .replace(/[,\.\-\~→>:\/·\(\)\?\!\:\n“”"'\+]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  };

  const userWordsOriginal = getRawWords(user);
  const expectedWordsOriginal = getRawWords(expected);

  const userWordsClean = userWordsOriginal.map(w => cleanString(w));
  const expectedWordsClean = expectedWordsOriginal.map(w => cleanString(w));

  const matchedExpectedIndices = new Set<number>();
  const matchedUserIndices = new Set<number>();
  const typos: { userWord: string; expectedWord: string }[] = [];

  // Step 1: Match identical or close phonetic matches (ignoring diacritics/accents)
  for (let i = 0; i < userWordsClean.length; i++) {
    for (let j = 0; j < expectedWordsClean.length; j++) {
      if (matchedExpectedIndices.has(j)) continue;
      
      const uW = userWordsClean[i];
      const eW = expectedWordsClean[j];
      
      if (uW === eW || stripDiacritics(uW) === stripDiacritics(eW)) {
        matchedUserIndices.add(i);
        matchedExpectedIndices.add(j);
        break;
      }
    }
  }

  // Step 2: Match typos (Levenshtein distance of 1 or 2)
  for (let i = 0; i < userWordsClean.length; i++) {
    if (matchedUserIndices.has(i)) continue;
    
    for (let j = 0; j < expectedWordsClean.length; j++) {
      if (matchedExpectedIndices.has(j)) continue;

      const uW = stripDiacritics(userWordsClean[i]);
      const eW = stripDiacritics(expectedWordsClean[j]);
      const dist = getLevenshteinDistance(uW, eW);

      // Sizing constraints to prevent false positives on tiny words
      const isTypo = (dist === 1 && eW.length >= 2) || (dist === 2 && eW.length >= 4);
      if (isTypo) {
        typos.push({ userWord: userWordsOriginal[i], expectedWord: expectedWordsOriginal[j] });
        matchedUserIndices.add(i);
        matchedExpectedIndices.add(j);
        break;
      }
    }
  }

  // Step 3: Categorize and output
  // Missing words (words in expected answer not matched)
  const missingWords = expectedWordsOriginal.filter((_, idx) => !matchedExpectedIndices.has(idx));
  
  // Wrong/incorrect words (words in user answer not matched & not small particle)
  const wrongWords = userWordsOriginal.filter((w, idx) => {
    if (matchedUserIndices.has(idx)) return false;
    const cleanW = stripDiacritics(w.toLowerCase());
    return !ignoreWrong.includes(cleanW) && cleanW.length > 1;
  });

  const details: string[] = [];

  if (typos.length > 0) {
    const typoStrs = typos.map(t => `"${t.userWord}" (đúng là "${t.expectedWord}")`);
    details.push(`Sai chính tả: ${typoStrs.join(', ')}`);
  }

  if (missingWords.length > 0) {
    const missingStrs = missingWords.map(w => `"${w}"`);
    details.push(`Thiếu từ: ${missingStrs.join(', ')}`);
  }

  if (wrongWords.length > 0) {
    const wrongStrs = wrongWords.map(w => `"${w}"`);
    details.push(`Ghi sai từ: ${wrongStrs.join(', ')}`);
  }

  if (details.length > 0) {
    return details.join(". ") + ".";
  }

  // Fallback if score is not perfect but details list was empty
  return "Chưa điền khớp chính xác các từ từ đáp án.";
}

type Screen = "login" | "dashboard" | "quiz" | "result";

interface AttemptRecord {
  id: string;
  timestamp: number;
  modeText: string;
  questionIds: number[];
  score: number;
  totalSubparts: number;
  correctSubparts: number;
  answers: Record<string, string>;
  results: Record<string, EvaluationResult>;
  durationSeconds: number;
}

// External pure helper to instantiate history records and comply with react-hooks rules-of-purity
function createAttemptRecord(
  modeText: string,
  questionIds: number[],
  score: number,
  totalSubparts: number,
  correctSubparts: number,
  answers: Record<string, string>,
  results: Record<string, EvaluationResult>,
  durationSeconds: number
): AttemptRecord {
  return {
    id: "rec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11),
    timestamp: Date.now(),
    modeText,
    questionIds,
    score,
    totalSubparts,
    correctSubparts,
    answers,
    results,
    durationSeconds
  };
}


export default function App() {
  // Navigation & Auth
  const [screen, setScreen] = useState<Screen>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Quiz Range Selection & Options
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>(QUESTIONS.map(q => q.id));
  const [customSelectMode, setCustomSelectMode] = useState(false);
  const [isExamActive, setIsExamActive] = useState(false);

  // Active Quiz State
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [questionCombinedAnswers, setQuestionCombinedAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<string, EvaluationResult>>({});
  const [score, setScore] = useState(0);
  const [totalSubpartsCount, setTotalSubpartsCount] = useState(0);
  const [correctSubpartsCount, setCorrectSubpartsCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | "errors" | "warnings">("all");

  // Local Storage Progress History
  const [history, setHistory] = useState<AttemptRecord[]>([]);
  const [selectedPastAttempt, setSelectedPastAttempt] = useState<AttemptRecord | null>(null);

  // Auto-save state checked
  const [hasSavedSession, setHasSavedSession] = useState(false);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Support physical/browser back button to navigate between screens
  useEffect(() => {
    const isAuthed = localStorage.getItem("auth_luyenthisocap") === "true";
    window.history.replaceState({ screen: isAuthed ? "dashboard" : "login" }, "", "");

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.screen) {
        setScreen(event.state.screen);
      } else {
        const authed = localStorage.getItem("auth_luyenthisocap") === "true";
        setScreen(authed ? "dashboard" : "login");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const changeScreen = (newScreen: Screen) => {
    setScreen(newScreen);
    window.history.pushState({ screen: newScreen }, "", "");
  };

  // Automatically scroll to top of window on screen navigation changes
  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (typeof document !== "undefined") {
      document.body.scrollTop = 0;
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
    }
  }, [screen]);

  // Load Auth state, storage history, and auto-save session upon mount
  useEffect(() => {
    const isAuthed = localStorage.getItem("auth_luyenthisocap");
    if (isAuthed === "true") {
      setTimeout(() => {
        setScreen("dashboard");
      }, 0);
    }
    
    // Check if there is an active session
    const savedActiveSession = localStorage.getItem("active_quiz_session");
    if (savedActiveSession) {
      setTimeout(() => {
        setHasSavedSession(true);
      }, 0);
    }

    const savedHistory = localStorage.getItem("history_luyenthisocap");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setTimeout(() => {
          setHistory(parsed);
        }, 0);
      } catch (e) {
        console.error("Error reading quiz history", e);
      }
    }
  }, []);

  // Timer runner for quiz
  useEffect(() => {
    if (isExamActive && screen === "quiz") {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExamActive, screen]);

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === "LeHoachienthang" && password === "100diem") {
      localStorage.setItem("auth_luyenthisocap", "true");
      changeScreen("dashboard");
      setLoginError("");
    } else {
      setLoginError("Tên đăng nhập hoặc mật khẩu không chính xác. Xin vui lòng thử lại!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_luyenthisocap");
    changeScreen("login");
    setUsername("");
    setPassword("");
  };

  // Pre-configured options
  const selectRange1_10 = () => {
    setSelectedQuestionIds(QUESTIONS.filter(q => q.category === "Kiến thức cơ bản").map(q => q.id));
    setCustomSelectMode(false);
  };

  const selectRange11_20 = () => {
    setSelectedQuestionIds(QUESTIONS.filter(q => q.category === "Ẩn dụ sơ cấp").map(q => q.id));
    setCustomSelectMode(false);
  };

  const selectAll = () => {
    setSelectedQuestionIds(QUESTIONS.map(q => q.id));
    setCustomSelectMode(false);
  };

  const handleToggleQuestionId = (id: number) => {
    setSelectedQuestionIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id].sort((a,b) => a-b)
    );
  };

  const resumeSavedSession = () => {
    const savedActiveSession = localStorage.getItem("active_quiz_session");
    if (savedActiveSession) {
      try {
        const parsed = JSON.parse(savedActiveSession);
        if (parsed && parsed.activeQuestions && parsed.activeQuestions.length > 0) {
          setActiveQuestions(parsed.activeQuestions);
          setUserAnswers(parsed.userAnswers || {});
          
          // Force clean the combined answers for Q1-Q10 to ensure they contain only circles/numbers if resuming stale session
          const cleanedCombined = { ...(parsed.questionCombinedAnswers || {}) };
          parsed.activeQuestions.forEach((q: Question) => {
            if (q.id <= 10) {
              q.subQuestions.forEach((sq) => {
                const labelWithoutCircle = sq.label.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").trim();
                if (labelWithoutCircle) {
                  const regex = new RegExp(labelWithoutCircle, "gi");
                  cleanedCombined[q.id] = (cleanedCombined[q.id] || "").replace(regex, "");
                }
              });
              // Remove leftover double spaces, colons
              cleanedCombined[q.id] = (cleanedCombined[q.id] || "")
                .replace(/[:：]/g, "")
                .replace(/ +/g, " ")
                .split("\n")
                .map((line: string) => line.trim())
                .join("\n");
            }
          });
          
          setQuestionCombinedAnswers(cleanedCombined);
          setElapsedTime(parsed.elapsedTime || 0);
          setSelectedQuestionIds(parsed.selectedQuestionIds || []);
          setIsExamActive(true);
          changeScreen("quiz");
        }
      } catch (e) {
        console.error("Error restoring quiz session", e);
      }
    }
  };

  const discardSavedSession = () => {
    if (confirm("Bạn có chắc chắn muốn hủy bài thi đang làm dở để bắt đầu lượt mới không?")) {
      localStorage.removeItem("active_quiz_session");
      setHasSavedSession(false);
    }
  };

  const startQuiz = () => {
    if (selectedQuestionIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 câu hỏi để thi thử!");
      return;
    }
    const filteredQuestions = QUESTIONS.filter(q => selectedQuestionIds.includes(q.id));
    setActiveQuestions(filteredQuestions);
    
    // Initialize answers
    const initialAnswers: Record<string, string> = {};
    const initialCombined: Record<number, string> = {};
    
    filteredQuestions.forEach(q => {
      const template = getQuestionInputTemplate(q);
      initialCombined[q.id] = template;
      
      const parsed = parseCombinedAnswers(template, q);
      q.subQuestions.forEach(sq => {
        initialAnswers[sq.id] = parsed[sq.id] || "";
      });
    });
    
    setUserAnswers(initialAnswers);
    setQuestionCombinedAnswers(initialCombined);
    setResults({});
    setElapsedTime(0);
    setIsExamActive(true);
    changeScreen("quiz");
  };

  // Save active quiz state to localStorage when changes occur
  useEffect(() => {
    if (screen === "quiz" && isExamActive) {
      const activeState = {
        activeQuestions,
        userAnswers,
        questionCombinedAnswers,
        elapsedTime,
        selectedQuestionIds,
      };
      localStorage.setItem("active_quiz_session", JSON.stringify(activeState));
      setTimeout(() => {
        setHasSavedSession(true);
      }, 0);
    }
  }, [screen, activeQuestions, userAnswers, questionCombinedAnswers, elapsedTime, selectedQuestionIds, isExamActive]);

  // Form Submission & Grading Check
  const handleSubmitQuiz = () => {
    setIsExamActive(false);

    let totalSubparts = 0;
    let correctSubparts = 0;
    const computedResults: Record<string, EvaluationResult> = {};

    activeQuestions.forEach(q => {
      q.subQuestions.forEach(sq => {
        totalSubparts++;
        const userValue = userAnswers[sq.id] || "";
        const evalRes = evaluateAnswer(userValue, sq.expectedAnswer);
        computedResults[sq.id] = evalRes;
        if (evalRes.isCorrect) {
          correctSubparts++;
        }
      });
    });

    const computedScore = totalSubparts > 0 ? Math.round((correctSubparts / totalSubparts) * 100) : 0;
    
    setResults(computedResults);
    setScore(computedScore);
    setTotalSubpartsCount(totalSubparts);
    setCorrectSubpartsCount(correctSubparts);

    // Save into history via pure external generator call
    const record = createAttemptRecord(
      getModeText(),
      [...selectedQuestionIds],
      computedScore,
      totalSubparts,
      correctSubparts,
      { ...userAnswers },
      computedResults,
      elapsedTime
    );

    const newHistory = [record, ...history];
    setHistory(newHistory);
    localStorage.setItem("history_luyenthisocap", JSON.stringify(newHistory));
    
    // Clear the autosaved session since it is submitted
    localStorage.removeItem("active_quiz_session");
    setHasSavedSession(false);

    // Flip Screen
    changeScreen("result");
    setActiveTab("all");
  };

  const clearHistory = () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử thi thử không?")) {
      setHistory([]);
      localStorage.removeItem("history_luyenthisocap");
    }
  };

  const getModeText = () => {
    const basicCount = QUESTIONS.filter(q => q.category === "Kiến thức cơ bản").length;
    const parableCount = QUESTIONS.filter(q => q.category === "Ẩn dụ sơ cấp").length;

    if (selectedQuestionIds.length === QUESTIONS.length) return `Toàn bộ đề (1-${QUESTIONS.length})`;
    
    const isBasicOnly = selectedQuestionIds.length === basicCount && selectedQuestionIds.every(id => QUESTIONS.find(q => q.id === id)?.category === "Kiến thức cơ bản");
    if (isBasicOnly) return `Phần 1: Kiến thức cơ bản (Câu 1-${basicCount})`;

    const isParablesOnly = selectedQuestionIds.length === parableCount && selectedQuestionIds.every(id => QUESTIONS.find(q => q.id === id)?.category === "Ẩn dụ sơ cấp");
    if (isParablesOnly) return `Phần 2: Ẩn dụ sơ cấp (Câu ${basicCount + 1}-${QUESTIONS.length})`;

    return `Tự chọn (${selectedQuestionIds.length} câu: ${selectedQuestionIds.join(", ")})`;
  };

  // Helper to format duration
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] relative flex flex-col font-sans selection:bg-[#0052FF] selection:text-white">
      
      {/* Decorative radial blur backgrounds */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#0052FF]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#4D7CFF]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Modern top bar */}
      <header className="sticky top-0 z-40 glass w-full py-4 border-b border-gray-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-accent text-white">
              <Award className="h-5 w-5 animate-pulse-subtle" />
            </div>
            <div>
              <h1 className="font-display text-xl tracking-tight text-[#0F172A]">Luyện Thi Sơ Cấp & Ẩn Dụ</h1>
              <p className="text-[10px] font-mono text-[#64748B] tracking-widest uppercase">Lê Thị Hoa</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {screen !== "login" && (
              <button 
                onClick={handleLogout}
                className="text-xs font-mono text-[#64748B] hover:text-[#0F172A] border border-gray-200 hover:border-[#0052FF]/40 rounded-lg px-3 py-1.5 transition-all"
              >
                Đăng Xuất
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-green-500/30 bg-green-50/80 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-green-700 font-semibold">Tự tin chiến thắng</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 relative z-10 flex flex-col justify-center">
        
        {/* SCREEN 1: LOGIN */}
        {screen === "login" && (
          <div className="w-full max-w-md mx-auto my-8">
            <motion.div 
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden p-8 sm:p-10 relative"
            >
              {/* Corner Accent Graphic */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#0052FF]/10 to-transparent rounded-tr-2xl" />
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 px-4 py-1.5 mb-4">
                  <span className="h-2 w-2 rounded-full bg-[#0052FF]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">Hệ thống bảo mật</span>
                </div>
                <h2 className="font-display text-3xl text-[#0F172A] mt-2 leading-tight">Chào mừng Lê Thị Hoa! 🌸</h2>
                <p className="text-sm text-[#64748B] mt-2 leading-relaxed">Vui lòng liên hệ tớ để biết account login.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#64748B] mb-2 font-medium">Tên đăng nhập (User Name)</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748B]/60" />
                    <input 
                      type="text" 
                      placeholder="Nhập tên đăng nhập..."
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 pl-12 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#64748B] mb-2 font-medium">Mật khẩu (Password)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#64748B]/60" />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 pl-12 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {loginError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs leading-relaxed flex items-start gap-2.5"
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </motion.div>
                )}

                <button 
                  type="submit"
                  className="w-full h-13 rounded-xl bg-gradient-accent text-white font-medium text-sm flex items-center justify-center gap-2 hover:shadow-accent-lg hover:-translate-y-0.5 transition-all cursor-pointer shadow-accent active:scale-[0.98]"
                >
                  Đăng Nhập Ngay <ChevronRight className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* SCREEN 2: DASHBOARD */}
        {screen === "dashboard" && (
          <div className="space-y-10">
            
            {/* Header section with profile name */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b border-gray-100 pb-8">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#0052FF] animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#0052FF]">Chào mừng Lê Thị Hoa</span>
                </div>
                <h2 className="font-display text-4xl text-[#0F172A] mt-2">Bắt đầu ôn luyện</h2>
                <p className="text-sm text-[#64748B] mt-1">Giô-suê 1: 9 &quot;Chẳng phải Ta đã truyền phán với con sao? Hãy mạnh dạn, can đảm! Chớ run sợ, chớ kinh hãi! Vì Giê-hô-va Đức Chúa Trời của con vẫn ở cùng con trong mọi nơi con đi.” 💪&quot;</p>
              </div>
              <div className="p-3 bg-[#0052FF]/5 border border-[#0052FF]/10 rounded-xl flex items-center gap-3">
                <Award className="h-8 w-8 text-[#0052FF]" />
                <div>
                  <div className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">Mục tiêu</div>
                  <div className="text-sm font-bold text-[#0F172A]">Dâng trọn 100 điểm lên Cha</div>
                </div>
              </div>
            </div>

            {/* Resume ongoing quiz card */}
            {hasSavedSession && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-[#0052FF]/10 text-[#0052FF] flex items-center justify-center shrink-0">
                     <Timer className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 text-[#0052FF] text-[10px] font-bold font-mono uppercase tracking-wider">
                      Lưu Tiến Độ Tự Động 💾
                    </span>
                    <h3 className="font-bold text-sm text-[#0F172A] mt-1">Bài ôn thi của bạn vẫn được lưu lại dở dang!</h3>
                    <p className="text-xs text-[#64748B] mt-0.5 font-medium">Bạn có thể tiếp tục làm câu hoàn thành dở này bất cứ lúc nào, không bị mất dữ liệu.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={discardSavedSession}
                    className="flex-1 sm:flex-none py-2 px-4 rounded-xl border border-gray-200 hover:bg-[#FF3E3E]/5 hover:text-red-500 text-xs font-semibold text-[#64748B] transition-all cursor-pointer bg-white"
                  >
                    Hủy & Làm Đề Mới
                  </button>
                  <button
                    onClick={resumeSavedSession}
                    className="flex-1 sm:flex-none py-2 px-5 rounded-xl bg-[#0052FF] hover:bg-[#0040D0] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/15 transition-all cursor-pointer"
                  >
                    Làm Tiếp <Sparkles className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Question Range Selection Card */}
              <div id="quiz-selection-card" className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="font-display text-xl text-[#0F172A] flex flex-wrap items-center justify-between gap-2.5">
                    <span className="flex items-center gap-2.5">
                      <BookOpen id="book-icon" className="h-5 w-5 text-[#0052FF]" /> Chọn danh sách câu hỏi ôn thi
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold font-display animate-pulse">
                      Mục tiêu: Dâng trọn 100 điểm lên Cha 🙌
                    </span>
                  </h3>
                  <p className="text-xs text-[#64748B] mt-2">Mặc định đã chọn toàn bộ câu hỏi ôn tập. Bạn có thể tự do chọn theo nhóm hoặc tự tích chọn riêng lẻ ở ô bên dưới.</p>
                </div>

                {/* Quick Selection Buttons */}
                <div className="grid grid-cols-2 gap-3 pb-2">
                  <button 
                    id="btn-select-1-10"
                    onClick={selectRange1_10}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      selectedQuestionIds.length === QUESTIONS.filter(q => q.category === "Kiến thức cơ bản").length &&
                      selectedQuestionIds.every(id => QUESTIONS.find(q => q.id === id)?.category === "Kiến thức cơ bản")
                        ? "border-[#0052FF] bg-[#0052FF]/5 text-[#0052FF] shadow-sm font-bold"
                        : "border-gray-200 hover:border-[#0052FF]/40 bg-white text-slate-700"
                    }`}
                  >
                    Chỉ chọn 1-10
                  </button>

                  <button 
                    id="btn-select-11-20"
                    onClick={selectRange11_20}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      selectedQuestionIds.length === QUESTIONS.filter(q => q.category === "Ẩn dụ sơ cấp").length &&
                      selectedQuestionIds.every(id => QUESTIONS.find(q => q.id === id)?.category === "Ẩn dụ sơ cấp")
                        ? "border-[#0052FF] bg-[#0052FF]/5 text-[#0052FF] shadow-sm font-bold"
                        : "border-gray-200 hover:border-[#0052FF]/40 bg-white text-slate-700"
                    }`}
                  >
                    Chỉ chọn 11-20
                  </button>

                  <button 
                    id="btn-select-all"
                    onClick={selectAll}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      selectedQuestionIds.length === QUESTIONS.length
                        ? "border-[#0052FF] bg-[#0052FF]/5 text-[#0052FF] shadow-sm font-bold"
                        : "border-gray-200 hover:border-[#0052FF]/40 bg-white text-slate-700"
                    }`}
                  >
                    Chọn toàn bộ (1-{QUESTIONS.length})
                  </button>

                  <button 
                    id="btn-clear-selection"
                    onClick={() => setSelectedQuestionIds([])}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      selectedQuestionIds.length === 0
                        ? "border-amber-300 bg-amber-50 text-amber-600 shadow-sm font-bold"
                        : "border-gray-200 hover:border-red-400 bg-white text-slate-500"
                    }`}
                  >
                    Chọn riêng lẻ (Trống)
                  </button>
                </div>

                {/* Grid checklist of questions */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-medium flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-[#64748B]" /> Click tích chọn câu hỏi (1 - {QUESTIONS.length})
                    </label>
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {QUESTIONS.map(q => q.id).map(id => {
                      const isSelected = selectedQuestionIds.includes(id);
                      const isBasic = QUESTIONS.find(q => q.id === id)?.category === "Kiến thức cơ bản";
                      return (
                        <button
                          key={id}
                          id={`question-select-${id}`}
                          onClick={() => handleToggleQuestionId(id)}
                          className={`h-11 rounded-xl text-xs font-mono font-bold border transition-all flex flex-col items-center justify-center relative select-none cursor-pointer ${
                            isSelected 
                              ? "bg-[#0052FF] text-white border-transparent shadow-accent" 
                              : "border-gray-200 hover:border-gray-300 bg-gray-50 text-[#0F172A]"
                          }`}
                          title={isBasic ? "Kiến thức cơ bản" : "Ẩn dụ sơ cấp"}
                        >
                          <span>{id}</span>
                          <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                            isSelected ? "bg-white" : isBasic ? "bg-blue-400" : "bg-purple-400"
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Confirm selections & launch block */}
                <div className="pt-6 border-t border-gray-100 bg-gray-50/60 -mx-6 sm:-mx-8 p-6 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-[#64748B] font-mono uppercase tracking-wider">Đã lựa chọn</div>
                    <div className="text-sm font-bold text-[#0F172A] mt-0.5">
                      {selectedQuestionIds.length > 0 
                        ? `${selectedQuestionIds.length} câu hỏi (${getModeText()})`
                        : "Chưa chọn câu hỏi nào (Đang trống)"
                      }
                    </div>
                  </div>

                  <button
                    id="btn-start-quiz"
                    onClick={startQuiz}
                    disabled={selectedQuestionIds.length === 0}
                    className="w-full sm:w-auto px-6 h-12 rounded-xl bg-gradient-accent text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-accent disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer shadow-accent-sm"
                  >
                    Bắt Đầu Thi Thử <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* History Progress log Column */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl text-[#0F172A] flex items-center gap-2.5">
                    <History className="h-5 w-5 text-[#0052FF]" /> Nhật ký tiến độ
                  </h3>
                  {history.length > 0 && (
                    <button 
                      onClick={clearHistory}
                      className="text-[11px] font-mono text-red-500 hover:text-red-700 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="h-3 w-3" /> Xóa sạch
                    </button>
                  )}
                </div>

                {/* Simple Stats Summary boxes */}
                {history.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-center">
                      <div className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">Lần thực hiện</div>
                      <div className="text-2xl font-display text-[#0F172A] mt-1">{history.length}</div>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-center">
                      <div className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">Điểm cao nhất</div>
                      <div className="text-2xl font-display text-[#0052FF] mt-1">
                        {Math.max(...history.map(h => h.score))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                    <div className="text-xs text-[#64748B] leading-relaxed">Chưa có lịch sử làm bài.<br />Hãy trải qua kỳ thi thử đầu tiên để ghi lại tiến độ!</div>
                  </div>
                )}

                {/* Scrollable list of history */}
                {history.length > 0 && (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                    {history.map((record) => {
                      const isPerfect = record.score === 100;
                      return (
                        <div 
                          key={record.id}
                          className="p-3.5 rounded-xl border border-gray-100 bg-white hover:border-[#0052FF]/30 transition-all flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-[#0F172A] line-clamp-1">{record.modeText}</div>
                            <div className="text-[9px] font-mono text-[#64748B]">
                              {new Date(record.timestamp).toLocaleString("vi-VN", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })} 
                              {" • "} {formatTime(record.durationSeconds)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                              isPerfect 
                                ? "bg-green-500 text-white shadow-emerald-sm" 
                                : record.score >= 80 
                                  ? "bg-[#0052FF]/10 text-[#0052FF]" 
                                  : "bg-amber-100 text-amber-800"
                            }`}>
                              {record.score}đ
                            </span>
                            
                            {/* View detailed review of list */}
                            <button
                              onClick={() => {
                                setSelectedPastAttempt(record);
                              }}
                              className="p-1 rounded-md hover:bg-gray-100 text-[#64748B] hover:text-[#0f172a] transition-all"
                              title="Xem lại bài làm này"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            </div>

            {/* Past Attempt Dialog Modal Backdrop */}
            <AnimatePresence>
              {selectedPastAttempt && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200"
                  >
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                      <div>
                        <div className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
                          Xem Lại Bài Thi: {new Date(selectedPastAttempt.timestamp).toLocaleString("vi-VN")}
                        </div>
                        <h4 className="font-display text-xl text-[#0F172A] mt-1">{selectedPastAttempt.modeText}</h4>
                      </div>
                      <button 
                        onClick={() => setSelectedPastAttempt(null)}
                        className="h-8 w-8 rounded-full hover:bg-gray-100 text-[#64748B] hover:text-[#0f172a] flex items-center justify-center transition-all"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-6 flex-grow no-scrollbar">
                      
                      {/* Score Summary Bar inside Modal */}
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="text-xs text-[#64748B] font-mono uppercase tracking-widest">Kết quả điểm số</div>
                          <div className="text-3xl font-display text-[#0F172A] mt-1">
                            {selectedPastAttempt.score} <span className="text-lg text-[#64748B]">/ 100 điểm</span>
                          </div>
                        </div>
                        <div className="text-xs text-[#64748B] leading-relaxed">
                          Đúng <span className="font-bold text-green-600">{selectedPastAttempt.correctSubparts}</span> trên tổng số <span className="font-bold">{selectedPastAttempt.totalSubparts}</span> phân lớp định nghĩa.<br />
                          Thời gian làm bài: <span className="font-mono font-bold text-[#0F172A]">{formatTime(selectedPastAttempt.durationSeconds)}</span>
                        </div>
                      </div>

                      {/* Display Question Sheets of selected record */}
                      <div className="space-y-4">
                        {QUESTIONS.filter(q => selectedPastAttempt.questionIds.includes(q.id)).map((q, index) => {
                          return (
                            <div key={q.id} className="p-5 rounded-xl border border-gray-200 space-y-4">
                              <h5 className="font-bold text-sm text-[#0F172A]">
                                Câu {q.id}. {q.title}
                              </h5>

                              <div className="space-y-3.5">
                                {q.subQuestions.map(sq => {
                                  const ans = selectedPastAttempt.answers[sq.id] || "Không trả lời";
                                  const res = selectedPastAttempt.results[sq.id] || { isCorrect: false, hasWarning: false, cleanUser: "" };
                                  return (
                                    <div key={sq.id} className="p-3.5 rounded-lg border bg-gray-50/50 space-y-2">
                                      <div className="text-xs font-medium text-[#0F172A]">{sq.label}</div>
                                      
                                      <div className="text-xs">
                                        <span className="text-[#64748B] font-mono">Đã viết: </span>
                                        <span className={res.isCorrect ? "font-semibold text-green-700" : "font-semibold text-red-600 line-through"}>
                                          {ans}
                                        </span>
                                      </div>

                                      {/* Indicator tag */}
                                      <div className="flex flex-wrap gap-2 pt-1">
                                        {res.isCorrect ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 text-[9px] font-semibold">
                                            <Check className="h-2.5 w-2.5" /> Đúng
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-700 text-[9px] font-semibold">
                                            <XCircle className="h-2.5 w-2.5" /> Chưa chính xác
                                          </span>
                                        )}

                                        {res.hasWarning && res.warningMessage && (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-semibold">
                                            <AlertTriangle className="h-2.5 w-2.5" /> Lưu ý: {res.warningMessage}
                                          </span>
                                        )}
                                      </div>

                                      {/* Correct and Explanatory segment */}
                                      <div className="text-xs border-t border-gray-200/50 pt-2 mt-2 space-y-2">
                                        <div>
                                          <div className="font-semibold text-green-800">Đáp án chuẩn:</div>
                                          <div className="text-slate-800 mt-0.5 font-medium">{sq.expectedAnswer}</div>
                                        </div>

                                        {!res.isCorrect && (
                                          <div className="p-2 sm:p-2.5 bg-red-50/80 border border-red-100 rounded-lg text-xs text-red-900 font-medium">
                                            <span className="font-bold text-red-700">Chi tiết lỗi sai/thiếu:</span> {analyzeMistakes(ans, sq.expectedAnswer)}
                                          </div>
                                        )}
                                        
                                        <div className="text-[#64748B] mt-1 italic text-[11px]">
                                          {sq.explanation && <><span className="font-semibold not-italic">Chú giải: </span>{sq.explanation}</>}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                      <button 
                        onClick={() => setSelectedPastAttempt(null)}
                        className="px-5 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        Đóng lại
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </div>
        )}

        {/* SCREEN 3: QUIZ EXAM PAGE */}
        {screen === "quiz" && (
          <div className="space-y-6">
            
            {/* Navigational caution + Timer sticky header */}
            <div className="sticky top-[73px] z-30 glass-dark -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 border-b border-white/10 text-white flex items-center justify-between gap-4 shadow-lg rounded-b-xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    // Progress is autosaved in background, so users can safely click this
                    changeScreen("dashboard");
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-all flex items-[#center] items-center gap-1.5 bg-white/5 hover:bg-white/15 px-2.5 py-1 text-xs font-semibold"
                  title="Quay lại danh sách câu hỏi"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span>Quay lại</span>
                </button>
                <div>
                  <h3 className="font-bold text-sm line-clamp-1">{getModeText()}</h3>
                  <p className="text-[10px] text-gray-300 font-mono uppercase tracking-wider">Đề thi gồm {activeQuestions.length} câu</p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-lg text-xs font-mono font-bold">
                  <Timer className="h-4 w-4 text-[#4D7CFF] animate-spin-slow" />
                  <span>{formatTime(elapsedTime)}</span>
                </div>
                
                <button
                  onClick={handleSubmitQuiz}
                  className="px-4 py-1.5 rounded-lg bg-gradient-accent text-white font-semibold text-xs transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer shadow-accent-sm"
                >
                  Nộp Bài Thi
                </button>
              </div>
            </div>

            {/* Main scroll sheets */}
            <div className="max-w-3xl mx-auto space-y-8 my-8 pb-12">
              
              <div className="text-center mb-6">
                <h4 className="font-display text-2xl text-[#0F172A] mt-2">Điền câu trả lời chuẩn xác của bạn</h4>
                <p className="text-xs text-[#64748B] mt-1">Hệ thống chấp nhận lỗi chính tả nhẹ, viết sai hoa hay thiếu dấu, nhưng hãy ghi nhớ điền đầy đủ ý nghĩa.</p>
              </div>

              {activeQuestions.map((q, qIndex) => {
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: qIndex * 0.05, duration: 0.4 }}
                    key={q.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-8 space-y-6 hover:shadow-lg transition-all"
                  >
                    {/* Header of question card */}
                    <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
                      <span className="font-mono text-xs font-bold text-white bg-gradient-accent h-6 w-6 rounded-full flex items-center justify-center shrink-0 shadow-accent">
                        {qIndex + 1}
                      </span>
                      <div className="space-y-1 w-full">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-[#64748B] bg-slate-100 px-2 py-0.5 rounded">
                          {q.category}
                        </span>
                        <h4 className="font-bold text-base text-[#0F172A] mt-1 leading-relaxed">
                          {q.title}
                        </h4>
                      </div>
                    </div>

                    {/* Sub-questions input grid */}
                    <div className="space-y-3">
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-[#0F172A]">
                          Câu trả lời của bạn:
                        </label>

                        <textarea
                          rows={Math.max(5, q.subQuestions.length * 2 + 1)}
                          value={questionCombinedAnswers[q.id] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuestionCombinedAnswers(prev => ({
                              ...prev,
                              [q.id]: val
                            }));
                            
                            const parsed = parseCombinedAnswers(val, q);
                            setUserAnswers(prev => ({
                              ...prev,
                              ...parsed
                            }));
                          }}
                          placeholder={`Vui lòng điền câu trả lời cho từng mục dưới dạng:\n① [Câu trả lời thứ 1]\n② [Câu trả lời thứ 2]`}
                          className="w-full text-base sm:text-lg rounded-xl border border-gray-200/80 p-4 bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all placeholder:text-gray-400 font-sans whitespace-pre-wrap leading-relaxed shadow-sm min-h-[140px]"
                        />
                      </div>
                    </div>

                  </motion.div>
                );
              })}

              {/* Submit panel bottom */}
              <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm text-center space-y-4">
                <div className="text-xs text-[#64748B]">Hãy rà soát kỹ các câu trả lời bên trên trước khi thực hiện nộp bài.</div>
                <button
                  onClick={handleSubmitQuiz}
                  className="w-full sm:w-auto px-8 h-12 rounded-xl bg-gradient-accent text-white font-medium text-sm flex items-center justify-center gap-2 mx-auto hover:shadow-accent transition-all cursor-pointer shadow-accent active:scale-[0.98]"
                >
                  Hoàn Thành & Chấm Điểm Thi <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* SCREEN 4: GRADING SHEET & RESULTS COMPLETED */}
        {screen === "result" && (
          <div className="space-y-8 relative">
            
            {/* Run custom Canvas Fireworks only on 100 points score */}
            {score === 100 && <Fireworks />}

            {/* Big celebratory header box */}
            <div className="w-full max-w-3xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-2xl border p-8 text-center relative overflow-hidden shadow-xl ${
                  score === 100 
                    ? "bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-transparent"
                    : "bg-white text-[#0F172A] border-gray-200"
                }`}
              >
                {/* Decorative particles background if 100 */}
                {score === 100 && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
                    <div className="absolute top-4 left-6 animate-float"><Sparkle className="text-yellow-400 h-6 w-6" /></div>
                    <div className="absolute bottom-6 right-10 animate-float-slow"><Sparkle className="text-[#0052FF] h-8 w-8" /></div>
                  </div>
                )}

                <div className="inline-flex items-center gap-3 rounded-full border border-gray-200/30 bg-white/5 px-4 py-1.5 mb-4 justify-center">
                  <span className={`h-2 w-2 rounded-full ${score === 100 ? "bg-green-400 animate-ping" : "bg-[#0052FF]"}`} />
                  <span className={`font-mono text-[10px] uppercase tracking-widest ${score === 100 ? "text-green-300" : "text-[#0052FF]"}`}>
                    Đã hoàn thành chấm điểm tự động
                  </span>
                </div>

                <h1 className="font-display text-4xl leading-tight">
                  Kết Quả: <span className={score === 100 ? "text-green-400 font-extrabold" : "text-[#0052FF]"}>{score} điểm</span>
                </h1>

                {/* Score count details */}
                <p className={`text-xs mt-2 ${score === 100 ? "text-gray-300" : "text-[#64748B]"}`}>
                  Bạn đã trả lời đúng <span className="font-bold">{correctSubpartsCount}</span> trên tổng số <span className="font-bold">{totalSubpartsCount}</span> phân lớp lý nghĩa trong đề thi.
                  {" • "} Thời gian: <span className="font-mono font-bold">{formatTime(elapsedTime)}</span>
                </p>

                {/* Big conditional congratulations text */}
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 max-w-md mx-auto">
                  {score === 100 ? (
                    <motion.div 
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ repeat: 5, repeatType: "reverse", duration: 0.4 }}
                      className="space-y-2"
                    >
                      <h3 className="text-xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-green-300">
                        Dâng chọn 100 điểm lên Cha 🙌
                      </h3>
                      <p className="text-sm text-green-300 font-semibold tracking-wide">
                        &quot;Chúc mừng cậu ^^ dâng chọn 100 điểm lên Cha nhé&quot;
                      </p>
                    </motion.div>
                  ) : (
                    <div>
                      <h3 className="text-sm font-bold text-amber-600">Tiếp tục cố gắng!</h3>
                      <p className="text-xs text-[#64748B] mt-1 font-semibold">
                        &quot;Sắp được rồi, cố gắng lần nữa nào&quot;
                      </p>
                    </div>
                  )}
                </div>

                {/* Main operational actions inside block */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={() => {
                      changeScreen("dashboard");
                    }}
                    className={`w-full sm:w-auto px-6 h-12 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      score === 100 
                        ? "bg-white text-slate-900 hover:bg-slate-100" 
                        : "bg-[#0F172A] text-white hover:bg-slate-800"
                    }`}
                  >
                    Về Trang Chủ Dashboard <ArrowLeft className="h-4 w-4" />
                  </button>

                  <button 
                    onClick={() => {
                      // Trigger exact study retry
                      setResults({});
                      setElapsedTime(0);
                      setIsExamActive(true);
                      changeScreen("quiz");
                    }}
                    className="w-full sm:w-auto px-6 h-12 rounded-xl bg-[#0052FF] text-white text-xs font-semibold hover:bg-[#0052FF]/95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-accent active:scale-[0.98]"
                  >
                    Làm Lại Bài Thi Này <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Sheet Detail with filter system tabs */}
            <div className="max-w-3xl mx-auto space-y-6 pb-20">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
                <h3 className="font-display text-xl text-[#0F172A] flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-[#0052FF]" /> Tấm Phiếu Kết Quả Khảo Sát
                </h3>

                {/* Filters */}
                <div className="flex rounded-lg bg-gray-100 p-1 text-xs font-mono">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-3 py-1 rounded transition-all ${activeTab === "all" ? "bg-white text-[#0F172A] font-bold shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"}`}
                  >
                    Tất cả ({totalSubpartsCount})
                  </button>
                  <button
                    onClick={() => setActiveTab("errors")}
                    className={`px-3 py-1 rounded transition-all ${activeTab === "errors" ? "bg-white text-red-600 font-bold shadow-sm" : "text-[#64748B] hover:text-red-500"}`}
                  >
                    Sai ({totalSubpartsCount - correctSubpartsCount})
                  </button>
                  <button
                    onClick={() => setActiveTab("warnings")}
                    className={`px-3 py-1 rounded transition-all ${activeTab === "warnings" ? "bg-white text-amber-600 font-bold shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"}`}
                  >
                    Lưu ý ({Object.values(results).filter(r => r.isCorrect && r.hasWarning).length})
                  </button>
                </div>
              </div>

              {/* Feed items of questions */}
              <div className="space-y-6">
                {activeQuestions.map((q, qIdx) => {
                  
                  // Filter sub-questions dynamically based on chosen tab
                  const visibleSubQuestions = q.subQuestions.filter(sq => {
                    const res = results[sq.id];
                    if (!res) return true;
                    if (activeTab === "errors") return !res.isCorrect;
                    if (activeTab === "warnings") return res.isCorrect && res.hasWarning;
                    return true; // "all"
                  });

                  if (visibleSubQuestions.length === 0) return null;

                  return (
                    <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
                      
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <span className="font-mono text-[10px] font-bold bg-[#0052FF]/10 text-[#0052FF] px-2.5 py-1 rounded-full">
                          Câu {q.id}
                        </span>
                        <h4 className="font-bold text-sm text-[#0F172A]">{q.title}</h4>
                      </div>

                      <div className="space-y-4 pt-1">
                        {visibleSubQuestions.map(sq => {
                          const res = results[sq.id];
                          const userVal = userAnswers[sq.id] || "";
                          
                          return (
                            <div 
                              key={sq.id} 
                              className={`p-4 rounded-xl border transition-all space-y-3 ${
                                !res || !res.isCorrect 
                                  ? "border-red-200 bg-red-50/20" 
                                  : res.hasWarning 
                                    ? "border-amber-200 bg-amber-50/20"
                                    : "border-green-100 bg-green-50/10"
                              }`}
                            >
                              <div className="text-xs font-bold text-[#0F172A]">{sq.label}</div>

                              {/* Your written entry */}
                              <div className="text-xs">
                                <span className="font-mono text-[#64748B]">Bài làm của bạn: </span>
                                <span className={res?.isCorrect ? "font-bold text-green-700" : "font-bold text-red-600 line-through"}>
                                  {userVal || "Chưa điền câu trả lời"}
                                </span>
                              </div>

                              {/* Notification warnings for typos, capitalization, diacritics */}
                              {res?.isCorrect && res.hasWarning && res.warningMessage && (
                                <div className="p-2.5 bg-amber-100/80 border border-amber-200 rounded-lg text-xs text-amber-900 font-medium flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
                                  <span>{res.warningMessage}</span>
                                </div>
                              )}

                              {/* Expected corrective answer if wrong */}
                              {(!res || !res.isCorrect) && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs space-y-2">
                                  <div>
                                    <div className="font-bold text-red-800">Đáp án chính xác:</div>
                                    <div className="text-slate-800 font-medium">{sq.expectedAnswer}</div>
                                  </div>

                                  <div className="pt-[7px] border-t border-red-200/60 text-red-900/90 font-medium text-[11px]">
                                    <span className="font-bold text-red-700">Chi tiết lỗi sai/thiếu:</span> {analyzeMistakes(userVal, sq.expectedAnswer)}
                                  </div>
                                </div>
                              )}

                              {/* Theological detail explanation callout block (Required by schema) */}
                              {sq.explanation && (
                                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs space-y-1 mt-2">
                                  <div className="font-semibold text-[#0F172A]">Giải thích chuẩn:</div>
                                  <div className="text-[#64748B] italic leading-relaxed text-[11px]">{sq.explanation}</div>
                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Persistent modern footer */}
      <footer className="w-full py-6 border-t border-gray-100 bg-[#F8FAFC] relative z-10 text-center">
        <div className="max-w-6xl mx-auto px-4 text-xs text-[#64748B] font-medium">
          © {new Date().getFullYear()} Luyện Thi Sơ Cấp
        </div>
      </footer>
    </div>
  );
}
