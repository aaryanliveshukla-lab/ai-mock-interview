'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Question = {
  question: string;
  expectedAnswer: string;
};

type Evaluation = {
  questionIndex: number;
  question: string;
  userAnswer: string;
  evaluation: {
    score: number;
    feedback: {
      strengths: string[];
      improvements: string[];
      suggestions: string[];
    };
  };
};

type OverallFeedback = {
  averageScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
};

const interviewTypeOptions = [
  { value: 'technical', label: 'Technical' },
  { value: 'hr', label: 'HR' },
  { value: 'managerial', label: 'Managerial' },
  { value: 'aptitude', label: 'Aptitude' },
  { value: 'behavioral', label: 'Behavioral' },
];

const difficultyOptions = ['easy', 'medium', 'hard'] as const;

export default function Interview() {
  const router = useRouter();

  const [setup, setSetup] = useState({
    title: '',
    role: '',
    level: 'fresher',
    interviewType: 'technical',
    difficulty: 'medium',
    questionCount: 5,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation[] | null>(null);
  const [overallFeedback, setOverallFeedback] = useState<OverallFeedback | null>(null);
  const [error, setError] = useState('');
  const [micError, setMicError] = useState('');
  
  // Webcam and Speech Recognition
  const [isRecording, setIsRecording] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const currentQuestion = questions[currentIndex];

  const startRecording = async () => {
    try {
      setMicError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        setIsTranscribing(true);
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob);

          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Failed to transcribe');
          
          setAnswers(current => current.map((item, index) => (index === currentIndex ? (item + ' ' + (data.text || '')).trim() : item)));
          
          // Auto-transition to next question if not the last one
          if (currentIndex < questions.length - 1) {
            setTimeout(() => {
              setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1));
            }, 1500); // 1.5 second delay to let user see transcribed text
          }
        } catch (err: any) {
          setMicError(`Transcription failed: ${err.message}`);
          setTimeout(() => setMicError(''), 5000);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setMicActive(true);
    } catch (err: any) {
      setMicError('Microphone access denied or not available.');
      setTimeout(() => setMicError(''), 5000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setMicActive(false);
    }
  };

  const toggleMic = () => {
    if (micActive) stopRecording();
    else startRecording();
  };

  useEffect(() => {
    const queryType = new URLSearchParams(window.location.search).get('type');
    if (queryType) {
      setSetup(current => ({ ...current, interviewType: queryType }));
    }
  }, []);

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // Enforce English
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      const voices = window.speechSynthesis.getVoices();
      // Try to find a good English voice
      const englishVoice = voices.find(v => v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural')));
      if (englishVoice) {
         utterance.voice = englishVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (questions.length > 0 && currentQuestion) {
      speakText(currentQuestion.question);
      // Also automatically open camera when interview starts
      if (!isRecording) setIsRecording(true);
    }
    
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentIndex, questions]);

  const canStart = useMemo(
    () => Boolean(setup.title.trim() && setup.role.trim() && setup.level.trim()),
    [setup.title, setup.role, setup.level]
  );

  const startInterview = async () => {
    setGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: setup.role,
          experience: setup.level,
          difficulty: setup.difficulty,
          interviewType: setup.interviewType,
          questionCount: setup.questionCount,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      setQuestions(data.questions || []);
      setAnswers(Array.from({ length: data.questions?.length || 0 }, () => ''));
      setCurrentIndex(0);
      setEvaluation(null);
      setOverallFeedback(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start interview');
    } finally {
      setGenerating(false);
    }
  };

  const updateAnswer = (value: string) => {
    setAnswers(current => current.map((item, index) => (index === currentIndex ? value : item)));
  };

  const finishInterview = async () => {
    setLoading(true);
    setError('');

    try {
      const evaluationResponse = await fetch('/api/evaluate-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions,
          answers,
        }),
      });

      const evaluationData = await evaluationResponse.json();
      if (!evaluationResponse.ok) {
        throw new Error(evaluationData.error || 'Failed to evaluate interview');
      }

      setEvaluation(evaluationData.evaluations || []);
      setOverallFeedback(evaluationData.overallFeedback || null);

      await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: setup.title,
          description: `A ${setup.interviewType} interview for ${setup.role}`,
          role: setup.role,
          level: setup.level,
          interviewType: setup.interviewType,
          difficulty: setup.difficulty,
          questions,
          answers,
          evaluations: evaluationData.evaluations,
          overallFeedback: evaluationData.overallFeedback,
        }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finish interview');
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = () => {
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setEvaluation(null);
    setOverallFeedback(null);
    setError('');
  };

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl shadow-indigo-950/20 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Interview Lab</p>
          <h1 className="mt-3 text-3xl font-bold">Set up your mock interview</h1>
          <p className="mt-2 text-slate-300">
            Pick a role, interview type, and difficulty. We’ll generate questions,
            collect your answers one by one, score your responses, and save the full session.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-200">Session Title</label>
              <input
                value={setup.title}
                onChange={event => setSetup(current => ({ ...current, title: event.target.value }))}
                placeholder="MERN Developer Mock Interview"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">Target Role</label>
              <input
                value={setup.role}
                onChange={event => setSetup(current => ({ ...current, role: event.target.value }))}
                placeholder="MERN Stack Developer"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">Experience Level</label>
              <input
                value={setup.level}
                onChange={event => setSetup(current => ({ ...current, level: event.target.value }))}
                placeholder="fresher / 2 years / 5 years"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">Interview Type</label>
              <select
                value={setup.interviewType}
                onChange={event =>
                  setSetup(current => ({ ...current, interviewType: event.target.value }))
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white"
              >
                {interviewTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">Difficulty</label>
              <select
                value={setup.difficulty}
                onChange={event =>
                  setSetup(current => ({ ...current, difficulty: event.target.value }))
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white"
              >
                {difficultyOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200">Questions</label>
              <input
                type="number"
                min={3}
                max={10}
                value={setup.questionCount}
                onChange={event =>
                  setSetup(current => ({ ...current, questionCount: Number(event.target.value) }))
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              disabled={!canStart || generating}
              onClick={startInterview}
              className="rounded-full bg-indigo-500 px-5 py-3 font-medium text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Start Interview'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="rounded-full border border-white/15 px-5 py-3 font-medium text-slate-200 hover:bg-white/5"
            >
              Back to Dashboard
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (overallFeedback) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Interview Complete</p>
          <h1 className="mt-3 text-3xl font-bold">{setup.title}</h1>
          <p className="mt-2 text-slate-300">{overallFeedback.summary}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-950/60 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Average Score</div>
              <div className="mt-2 text-3xl font-semibold">{overallFeedback.averageScore}/10</div>
            </div>
            <div className="rounded-2xl bg-slate-950/60 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Strengths</div>
              <ul className="mt-2 space-y-1 text-sm text-slate-200">
                {overallFeedback.strengths.map(item => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-950/60 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Improvement</div>
              <ul className="mt-2 space-y-1 text-sm text-slate-200">
                {overallFeedback.improvements.map(item => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white">
          <h2 className="text-2xl font-semibold">Per Question Feedback</h2>
          <div className="mt-6 space-y-4">
            {evaluation?.map(entry => (
              <div key={entry.questionIndex} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-medium">{entry.question}</h3>
                  <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-sm text-indigo-200">
                    {entry.evaluation.score}/10
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-300">{entry.userAnswer}</p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {[
                    ['Strengths', entry.evaluation.feedback.strengths],
                    ['Improvements', entry.evaluation.feedback.improvements],
                    ['Suggestions', entry.evaluation.feedback.suggestions],
                  ].map(([label, items]) => (
                    <div key={label as string} className="rounded-xl bg-white/5 p-3">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
                      <ul className="mt-2 space-y-1 text-sm text-slate-200">
                        {(items as string[]).map(item => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetInterview}
              className="rounded-full bg-indigo-500 px-5 py-3 font-medium text-white hover:bg-indigo-400"
            >
              Start Another
            </button>
            <button
              type="button"
              onClick={() => router.push('/history')}
              className="rounded-full border border-white/15 px-5 py-3 font-medium text-slate-200 hover:bg-white/5"
            >
              View History
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 text-white">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Live Interview</p>
            <h1 className="mt-3 text-3xl font-bold">{setup.title}</h1>
            <p className="mt-2 text-slate-300">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-950/60 px-4 py-3 text-right">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Type</div>
            <div className="mt-1 font-medium">{setup.interviewType}</div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
               <h2 className="text-2xl font-semibold">{currentQuestion.question}</h2>
               <button 
                  onClick={() => speakText(currentQuestion.question)}
                  className={`flex items-center justify-center rounded-full p-2 transition ${isSpeaking ? 'bg-indigo-500 animate-pulse text-white' : 'bg-white/10 hover:bg-white/20 text-slate-300'}`}
                  title="Read Question Aloud"
               >
                  🔊
               </button>
            </div>
            <p className="mt-2 text-sm text-slate-300">
              Expected answer guidance: {currentQuestion.expectedAnswer}
            </p>

            <div className="mt-6 relative">
              <textarea
                value={answers[currentIndex] ?? ''}
                onChange={event => updateAnswer(event.target.value)}
                rows={9}
                placeholder="Type your answer here or use the microphone..."
                className="w-full rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-white placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={toggleMic}
                disabled={isTranscribing}
                className={`absolute bottom-4 right-4 rounded-full p-3 ${
                  isTranscribing ? 'bg-indigo-600/50 cursor-wait' :
                  micActive ? 'bg-red-500 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500'
                } transition text-white shadow-lg`}
                title="Toggle Voice Input"
              >
                {isTranscribing ? '⏳ Processing' : micActive ? '🔴 Stop' : '🎤 Record'}
              </button>
            </div>
            {micError && (
              <p className="mt-3 rounded-xl bg-amber-500/20 px-4 py-2 text-sm text-amber-200 border border-amber-500/30">
                ⚠️ {micError}
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-black/50 overflow-hidden relative min-h-[300px]">
            {isRecording ? (
              <>
                <video
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 h-full w-full object-cover"
                  ref={(videoElement) => {
                    if (videoElement && !videoElement.srcObject) {
                      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                        .then(stream => { videoElement.srcObject = stream; })
                        .catch(err => console.error("Camera error:", err));
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setIsRecording(false)}
                  className="absolute top-4 right-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white hover:bg-red-500/80 backdrop-blur"
                >
                  Turn Off Camera
                </button>
              </>
            ) : (
              <div className="text-center p-6">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                  📷
                </div>
                <h3 className="text-lg font-medium text-white">Camera Disabled</h3>
                <p className="mt-2 text-sm text-slate-400">Turn on your camera for a more realistic interview experience and body language analysis.</p>
                <button
                  type="button"
                  onClick={() => setIsRecording(true)}
                  className="mt-4 rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  Enable Camera
                </button>
              </div>
            )}
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCurrentIndex(index => Math.max(index - 1, 0))}
              disabled={currentIndex === 0}
              className="rounded-full border border-white/15 px-5 py-3 font-medium text-slate-200 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentIndex(index => Math.min(index + 1, questions.length - 1))}
              disabled={currentIndex === questions.length - 1}
              className="rounded-full border border-white/15 px-5 py-3 font-medium text-slate-200 disabled:opacity-40"
            >
              Next
            </button>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetInterview}
              className="rounded-full border border-white/15 px-5 py-3 font-medium text-slate-200"
            >
              Reset Setup
            </button>
            <button
              type="button"
              onClick={finishInterview}
              disabled={loading}
              className="rounded-full bg-indigo-500 px-5 py-3 font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
            >
              {loading ? 'Evaluating...' : 'Finish Interview'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
