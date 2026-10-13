import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { TaskBlock, UserProfile } from '../types';
import { playSound } from '../utils/gameLogic';

interface AiVoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  tasks: TaskBlock[];
  onAddTask: (task: Omit<TaskBlock, 'id'>) => void;
  onOpenRescueModal: () => void;
  onStartFocus: (title: string, duration?: number) => void;
}

export const AiVoiceAssistantModal: React.FC<AiVoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  profile,
  tasks,
  onAddTask,
  onOpenRescueModal,
  onStartFocus,
}) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    { sender: 'user' | 'assistant'; text: string; actionType?: string; actionData?: any }[]
  >([
    {
      sender: 'assistant',
      text: `Hello ${profile.name}! I am your TIMEGENIUS tactical assistant. Speak or type your request (e.g. "Create a 30m Maths session", "Rescue my evening", or "Move Physics to tomorrow").`,
    },
  ]);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Indian English / global

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleSendQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your current browser. You can type your request below!');
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
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const handleSendQuery = async (customQuery?: string) => {
    const textToSend = customQuery || query;
    if (!textToSend.trim()) return;

    const userMsg = textToSend.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMsg,
          currentTimetable: tasks,
          userProfile: profile,
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const reply = resData.data.reply;
        const actionType = resData.data.actionType;
        const actionData = resData.data.actionData;

        setMessages((prev) => [
          ...prev,
          { sender: 'assistant', text: reply, actionType, actionData },
        ]);

        // Speak aloud if browser supports speechSynthesis
        if (window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(reply);
          utterance.rate = 1.05;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: "I've noted that! Let's stay dialed into your highest priority mission right now.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = (actionType: string, actionData: any) => {
    playSound('complete');
    if (actionType === 'create_task') {
      onAddTask({
        day: 'Today',
        startTime: '18:00',
        endTime: '18:45',
        subject: actionData.subject || 'Targeted Focus Session',
        description: actionData.taskName || 'Scheduled via AI Voice Assistant',
        priority: 'high',
        category: 'practice',
        isFixed: false,
        completed: false,
        durationMinutes: actionData.durationMinutes || 45,
        aiRationale: 'Voice commanded tactical session',
      });
      onClose();
    } else if (actionType === 'rescue_day') {
      onClose();
      onOpenRescueModal();
    } else if (actionType === 'start_focus') {
      onClose();
      onStartFocus(actionData.subject || 'Instant Sprint', 30);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-6 flex flex-col h-[560px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[2px] flex items-center justify-center">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-300" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>AI Tactical Assistant</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  VOICE & TEXT
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Natural language schedule adjustments</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-br-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>

              {/* Action trigger button if intent detected */}
              {m.actionType && m.actionType !== 'advice_only' && (
                <button
                  onClick={() => handleExecuteAction(m.actionType!, m.actionData)}
                  className="mt-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold px-3 py-1.5 rounded-xl text-[11px] shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {m.actionType === 'create_task'
                      ? 'Add Task to Schedule'
                      : m.actionType === 'rescue_day'
                      ? 'Open Rescue My Day'
                      : 'Launch Focus Session'}
                  </span>
                </button>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 bg-slate-950 px-3 py-2 rounded-2xl border border-slate-800 w-fit">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing schedule commands...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          {[
            'Create a 30m Maths session',
            'I missed my evening, rescue my day',
            'Start 45m focus on Physics',
          ].map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendQuery(prompt)}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
          {/* Voice Microphone Toggle */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40'
                : 'bg-slate-800 text-cyan-400 hover:bg-slate-700 border border-slate-700'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            placeholder={isListening ? 'Listening to your voice...' : 'Type a command or question...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendQuery();
            }}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />

          <button
            type="button"
            onClick={() => handleSendQuery()}
            disabled={!query.trim() || isLoading}
            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-all cursor-pointer flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
