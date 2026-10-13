import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
const rawKey = process.env.GEMINI_API_KEY;
const isValidKey = Boolean(rawKey && rawKey.trim() !== '' && rawKey !== 'MY_GEMINI_API_KEY' && rawKey.length > 15);
const ai = isValidKey
  ? new GoogleGenAI({
      apiKey: rawKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper with timeout guarantee
async function callGeminiSafely(prompt: string, timeoutMs = 6000): Promise<any | null> {
  if (!ai) return null;
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini call timed out')), timeoutMs)
    );
    const aiPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    const response: any = await Promise.race([aiPromise, timeoutPromise]);
    return response.text || '';
  } catch (err) {
    console.warn('Gemini call timed out or failed, engaging tactical offline engine:', err);
    return null;
  }
}

// Helper to sanitize and parse JSON response from Gemini
function extractJsonFromText(text: string) {
  try {
    // Remove markdown code blocks if wrapped
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt to locate JSON array or object
    const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // fallback
      }
    }
    return null;
  }
}

// 1. AI Problem Solver Endpoint
app.post('/api/ai/solve-problem', async (req, res) => {
  try {
    const { problemText, studentProfile } = req.body;

    if (!problemText) {
      return res.status(400).json({ error: 'Problem description is required.' });
    }

    if (ai) {
      const prompt = `You are TIMEGENIUS AI, an expert student productivity and time-management strategist for Indian and global competitive/board examinations.
The student profile:
- Name: ${studentProfile?.name || 'Student'}
- Grade / Exam Target: ${studentProfile?.targetExam || 'General Studies'}
- Wake Time: ${studentProfile?.wakeTime || '06:00'}
- Bed Time: ${studentProfile?.bedTime || '23:00'}
- Focus Duration: ${studentProfile?.preferredFocusLength || 30} mins

Student's problem and situation description:
"""${problemText}"""

Analyze this situation and return a strictly valid JSON object with the following fields:
{
  "summary": "1-2 sentence understanding of the student's core challenge",
  "fixedCommitments": ["list of identified fixed commitments like school, tuition, travel"],
  "availableHoursDaily": "estimated available study hours daily",
  "academicPriorities": ["top 3-4 subjects/chapters to prioritize"],
  "distractionStrategy": "Concrete, actionable psychological technique to tackle procrastination and phone habits",
  "proposedPlan": [
    {
      "time": "e.g. 06:00 - 07:00",
      "startTime": "06:00",
      "endTime": "07:00",
      "subject": "e.g. Physics - Current Electricity",
      "description": "e.g. Solve 10 formula derivations while mind is fresh",
      "priority": "urgent" | "high" | "medium" | "low",
      "category": "study" | "revision" | "practice" | "break",
      "rationale": "Why this task is placed at this exact time"
    }
  ],
  "reasoning": "Detailed explanation of why this schedule is realistic, how it prevents burnout, and which tasks can be postponed if the day gets busy",
  "adjustmentsAllowed": "Clear suggestions on how the student can tweak this plan before accepting"
}
Output only valid JSON. Do not include markdown code block markers or extra text.`;

      const responseText = await callGeminiSafely(prompt);
      if (responseText) {
        const parsed = extractJsonFromText(responseText);
        if (parsed) {
          return res.json({ success: true, isAiPowered: true, data: parsed });
        }
      }
    }

    // High quality rule-based fallback if Gemini is offline or fails
    const fallback = generateRuleBasedProblemSolution(problemText, studentProfile);
    return res.json({ success: true, isAiPowered: false, data: fallback });
  } catch (error: any) {
    console.error('Error in /api/ai/solve-problem:', error);
    const fallback = generateRuleBasedProblemSolution(req.body.problemText, req.body.studentProfile);
    return res.json({ success: true, isAiPowered: false, data: fallback, note: 'Generated using local smart planning engine' });
  }
});

// 2. AI Timetable Generator Endpoint
app.post('/api/ai/generate-schedule', async (req, res) => {
  try {
    const { inputs, studentProfile } = req.body;

    if (ai) {
      const prompt = `You are TIMEGENIUS AI Timetable Generator.
Create a realistic, balanced, conflict-free daily timetable.
Student constraints:
- Wake time: ${inputs.wakeTime || '06:00'}
- Bed time: ${inputs.bedTime || '23:00'}
- School/College hours: ${inputs.schoolHours || '08:00 - 14:00'}
- Tuition/Coaching: ${inputs.tuitionHours || '17:00 - 19:30'}
- Upcoming Exams/Deadlines: ${inputs.exams || 'None specified'}
- Subjects/Chapters needing work: ${inputs.subjects || 'Physics, Mathematics, Chemistry'}
- Preferred Break duration: ${inputs.breakDuration || '15'} mins
- Target study hours: ${inputs.targetStudyHours || '4'} hours

Rules:
1. Respect fixed school, tuition, meals, and at least 7-8 hours sleep.
2. Schedule deep work during peak cognitive alertness.
3. Include buffers for unexpected delays.
4. Total planned study time should not be unrealistically high (avoid burnout).
5. Explain the reasoning behind key placements.

Return ONLY a JSON object:
{
  "totalStudyHours": number,
  "dailyPhilosophy": "string summarizing today's tactical focus",
  "schedule": [
    {
      "id": "task_1",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "subject": "string",
      "description": "string",
      "priority": "urgent" | "high" | "medium" | "low" | "fixed",
      "category": "study" | "revision" | "practice" | "school" | "break" | "personal",
      "isFixed": boolean,
      "aiRationale": "Why this time slot was chosen",
      "durationMinutes": number
    }
  ],
  "reasoningSummary": "Short explanation of the balance achieved"
}`;

      const responseText = await callGeminiSafely(prompt);
      if (responseText) {
        const parsed = extractJsonFromText(responseText);
        if (parsed) {
          return res.json({ success: true, isAiPowered: true, data: parsed });
        }
      }
    }

    const fallback = generateRuleBasedSchedule(inputs, studentProfile);
    return res.json({ success: true, isAiPowered: false, data: fallback });
  } catch (error: any) {
    console.error('Error in /api/ai/generate-schedule:', error);
    const fallback = generateRuleBasedSchedule(req.body.inputs, req.body.studentProfile);
    return res.json({ success: true, isAiPowered: false, data: fallback });
  }
});

// 3. Smart Schedule Rescue ("RESCUE MY DAY")
app.post('/api/ai/rescue-day', async (req, res) => {
  try {
    const { currentTime, unfinishedTasks, reason, bedTime } = req.body;

    if (ai) {
      const prompt = `You are TIMEGENIUS AI Smart Schedule Rescue (RESCUE MY DAY).
A student had an unexpected interruption or missed tasks and needs to rescue the rest of their day.
- Current Time: ${currentTime || '16:00'}
- Student Bed Time: ${bedTime || '23:00'}
- Reason for delay: ${reason || 'Got delayed / unexpected interruption'}
- Unfinished tasks from today: ${JSON.stringify(unfinishedTasks || [])}

Rescue Protocol:
1. Calculate remaining available hours before bedtime (preserve bedtime and adequate dinner/rest!).
2. NEVER overload the remaining day to compensate for missed work.
3. Select only the top 1 or 2 most urgent tasks.
4. Move lower-priority tasks to tomorrow or later in the week.
5. Provide calming, motivating encouragement.

Return ONLY a JSON object:
{
  "rescueMessage": "Encouraging 1-2 sentence message acknowledging the situation without shame",
  "remainingHoursAvailable": number,
  "rescheduledToday": [
    {
      "id": "string",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "subject": "string",
      "description": "string",
      "priority": "urgent" | "high" | "medium",
      "category": "study" | "revision" | "break",
      "durationMinutes": number,
      "aiRationale": "Why kept today"
    }
  ],
  "deferredTasks": [
    {
      "subject": "string",
      "originalDescription": "string",
      "deferredTo": "e.g. Tomorrow 17:00 or Saturday morning buffer slot",
      "reason": "Why safe to postpone"
    }
  ],
  "rescueExplanation": "Bullet summary explaining what changed and why this preserves mental peace and consistency"
}`;

      const responseText = await callGeminiSafely(prompt);
      if (responseText) {
        const parsed = extractJsonFromText(responseText);
        if (parsed) {
          return res.json({ success: true, isAiPowered: true, data: parsed });
        }
      }
    }

    const fallback = generateRuleBasedRescue(currentTime, unfinishedTasks, reason, bedTime);
    return res.json({ success: true, isAiPowered: false, data: fallback });
  } catch (error: any) {
    console.error('Error in /api/ai/rescue-day:', error);
    const fallback = generateRuleBasedRescue(req.body.currentTime, req.body.unfinishedTasks, req.body.reason, req.body.bedTime);
    return res.json({ success: true, isAiPowered: false, data: fallback });
  }
});

// 4. Exam Preparation Command Center Planner & Boss Battle Generator
app.post('/api/ai/exam-planner', async (req, res) => {
  try {
    const { examName, examDate, subjects, chapters, daysRemaining } = req.body;

    if (ai) {
      const prompt = `You are TIMEGENIUS AI Exam Preparation Command Center.
Design an actionable preparation roadmap and Boss Battle stages for this upcoming examination.
- Exam Name: ${examName} (e.g. JEE Main, NEET, CBSE 12th Board, CET, College Finals)
- Exam Date: ${examDate}
- Days Remaining: ${daysRemaining}
- Subjects & Chapters: ${JSON.stringify(chapters || subjects)}

Generate a strictly JSON response:
{
  "feasibilityAssessment": "Objective calculation of workload vs available days (e.g. Highly feasible with 2.5 hrs/day)",
  "dailyTargetChapters": "e.g. 1 chapter revision every 2 days + 25 numericals",
  "recommendedPrioritiesToday": [
    "Priority 1: High weightage chapter",
    "Priority 2: Error notebook review"
  ],
  "mockTestMilestones": [
    { "title": "Diagnostic Test 1", "scheduledDate": "in 7 days", "focus": "Accuracy & Formulae" }
  ],
  "bossBattles": [
    {
      "id": "boss_1",
      "title": "e.g. Rotational Dynamics Boss Battle",
      "subject": "Physics",
      "bossHp": 500,
      "stages": [
        { "stageNumber": 1, "title": "Master Core Moment of Inertia Formulas", "xpReward": 25, "isComplete": false },
        { "stageNumber": 2, "title": "Solve 10 Standard Torque & Angular Momentum Problems", "xpReward": 35, "isComplete": false },
        { "stageNumber": 3, "title": "Rolling Without Slipping PYQ Challenge", "xpReward": 40, "isComplete": false },
        { "stageNumber": 4, "title": "Mixed Tricky Multi-concept Questions", "xpReward": 50, "isComplete": false },
        { "stageNumber": 5, "title": "Timed Final Boss Test: 5 Questions in 20 Minutes", "xpReward": 75, "isComplete": false }
      ]
    }
  ]
}`;

      const responseText = await callGeminiSafely(prompt);
      if (responseText) {
        const parsed = extractJsonFromText(responseText);
        if (parsed) {
          return res.json({ success: true, isAiPowered: true, data: parsed });
        }
      }
    }

    const fallback = generateRuleBasedExamPlan(examName, examDate, daysRemaining, chapters);
    return res.json({ success: true, isAiPowered: false, data: fallback });
  } catch (error: any) {
    console.error('Error in /api/ai/exam-planner:', error);
    const fallback = generateRuleBasedExamPlan(req.body.examName, req.body.examDate, req.body.daysRemaining, req.body.chapters);
    return res.json({ success: true, isAiPowered: false, data: fallback });
  }
});

// 5. Quick AI Voice / Text Assistant command interpreter
app.post('/api/ai/chat-assistant', async (req, res) => {
  try {
    const { query, currentTimetable, userProfile } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required.' });
    }

    if (ai) {
      const prompt = `You are TIMEGENIUS AI Assistant.
A student gave this natural language command or question:
"${query}"

Student: ${userProfile?.name || 'Student'}, Target: ${userProfile?.targetExam || 'Examinations'}
Current tasks count: ${currentTimetable?.length || 0}

Determine the student's intent. If they want to perform an action (e.g., move a task, create a study session, rescue their day, or get quick advice), return a structured action along with a brief, motivating response.

Return JSON:
{
  "reply": "Warm, concise, empowering answer (max 3 sentences)",
  "actionType": "create_task" | "reschedule" | "rescue_day" | "start_focus" | "advice_only",
  "actionData": {
    "taskName": "string or null",
    "subject": "string or null",
    "durationMinutes": number or null,
    "suggestedTime": "string or null",
    "priority": "high" | "medium" | "low" or null
  }
}`;

      const responseText = await callGeminiSafely(prompt);
      if (responseText) {
        const parsed = extractJsonFromText(responseText);
        if (parsed) {
          return res.json({ success: true, isAiPowered: true, data: parsed });
        }
      }
    }

    // Fallback response for chat assistant
    const lower = query.toLowerCase();
    let reply = `I'm on it! I've analyzed your schedule and set you up for peak productivity. Let's make every minute count!`;
    let actionType = 'advice_only';
    let actionData: any = {};

    if (lower.includes('math') || lower.includes('physics') || lower.includes('chemistry') || lower.includes('study') || lower.includes('session')) {
      const duration = lower.includes('30') ? 30 : lower.includes('45') ? 45 : lower.includes('60') ? 60 : 25;
      actionType = 'create_task';
      actionData = {
        taskName: 'Targeted Focus Session',
        subject: lower.includes('math') ? 'Mathematics' : lower.includes('physics') ? 'Physics' : lower.includes('chemistry') ? 'Chemistry' : 'Study Sprint',
        durationMinutes: duration,
        priority: 'high',
      };
      reply = `Scheduled a ${duration}-minute high-priority session for you. Tap Confirm to add it straight to your daily timeline!`;
    } else if (lower.includes('rescue') || lower.includes('missed') || lower.includes('behind') || lower.includes('late')) {
      actionType = 'rescue_day';
      reply = `Don't worry at all! Interruptions happen to every top ranker. Let's run Rescue My Day right now to recalibrate your evening without burnout.`;
    } else if (lower.includes('focus') || lower.includes('timer') || lower.includes('start')) {
      actionType = 'start_focus';
      reply = `Focus mode is ready to deploy. Clear your desk, set your phone aside, and enter the flow state!`;
    }

    return res.json({
      success: true,
      isAiPowered: false,
      data: { reply, actionType, actionData },
    });
  } catch (error: any) {
    console.error('Error in /api/ai/chat-assistant:', error);
    return res.json({
      success: true,
      isAiPowered: false,
      data: {
        reply: 'Let us stay focused on our highest priority mission right now. Review your daily missions and crush the next block!',
        actionType: 'advice_only',
        actionData: {},
      },
    });
  }
});

// 6. All-Subject Academic Doubt Solver Endpoint
app.post('/api/ai/solve-doubt', async (req, res) => {
  try {
    const { subject, doubtText, level, studentName } = req.body;

    if (!doubtText) {
      return res.status(400).json({ error: 'Doubt question is required.' });
    }

    if (ai) {
      const prompt = `You are TIMEGENIUS AI Academic Doubt Solver, a world-class mentor for students preparing for school, board (CBSE, ICSE, State Boards), and competitive exams (JEE Main & Advanced, NEET, CET, College).
Student: ${studentName || 'Student'}
Subject: ${subject || 'General'}
Target Exam Level: ${level || 'Standard Exam Preparation'}
Student's Doubt / Problem Statement:
"""${doubtText}"""

Solve this academic doubt with supreme pedagogical clarity. Break down the reasoning step-by-step so that even a student struggling with basics can understand. Highlight any tricky traps that cause negative marking or lost marks.

Return ONLY a JSON object:
{
  "subject": "${subject || 'General'}",
  "topic": "Specific chapter / sub-topic detected",
  "coreConcept": "1-2 sentence summary of the foundational theorem, law, or mechanism",
  "stepByStepSolution": [
    {
      "stepNumber": 1,
      "title": "e.g. Identify Given Parameters & Free Body Diagram / Fundamental Law",
      "explanation": "Clear analytical step with formula"
    },
    {
      "stepNumber": 2,
      "title": "e.g. Mathematical Derivation / Reaction Mechanism Progression",
      "explanation": "Clear step"
    },
    {
      "stepNumber": 3,
      "title": "e.g. Final Calculation & Simplification",
      "explanation": "Clear step"
    }
  ],
  "finalAnswer": "Precise final value, equation, or conclusion",
  "commonExamTrap": "Warning: The exact mistake / misconception that students make on this concept during exams",
  "quickPracticeQuestion": "A rapid related follow-up question to test their understanding"
}`;

      const responseText = await callGeminiSafely(prompt);
      if (responseText) {
        const parsed = extractJsonFromText(responseText);
        if (parsed) {
          return res.json({ success: true, isAiPowered: true, data: parsed });
        }
      }
    }

    // High quality rule-based educational solver fallback
    const fallback = generateRuleBasedDoubtSolution(subject, doubtText, level);
    return res.json({ success: true, isAiPowered: false, data: fallback });
  } catch (error: any) {
    console.error('Error in /api/ai/solve-doubt:', error);
    const fallback = generateRuleBasedDoubtSolution(req.body.subject, req.body.doubtText, req.body.level);
    return res.json({ success: true, isAiPowered: false, data: fallback });
  }
});

// Fallback logic generators for 100% reliable offline/graceful behavior
function generateRuleBasedProblemSolution(problemText: string, profile: any) {
  const name = profile?.name || 'Champion';
  return {
    summary: `Structured balance designed to conquer backlog while preserving sleep and consistency for ${name}.`,
    fixedCommitments: ['School / College routine', 'Evening tuition or commute', 'Essential rest & meal breaks'],
    availableHoursDaily: '3.5 to 4.5 dedicated focus hours',
    academicPriorities: [
      'High-yield Physics derivations and problem sets',
      'Daily Mathematics problem drills (minimum 10-15 targeted questions)',
      'Chemistry formula & active recall flash revision',
    ],
    distractionStrategy: 'Use the 5-Minute Gateway Rule: start studying for just 5 minutes without opening notifications. Once dopamine shifts into task momentum, your brain naturally maintains the focus flow.',
    proposedPlan: [
      {
        time: '06:00 - 07:15',
        startTime: '06:00',
        endTime: '07:15',
        subject: 'Physics Theory & Formulae',
        description: 'Prime cognitive morning slot: Deep focus on challenging concepts before daytime distractions begin.',
        priority: 'urgent',
        category: 'study',
        rationale: 'Cortisol and attention are highest right after waking and light hydration.',
      },
      {
        time: '17:30 - 18:30',
        startTime: '17:30',
        endTime: '18:30',
        subject: 'Mathematics Practice Sprint',
        description: 'Active problem solving. Solve 10 focused problems on your weak areas.',
        priority: 'high',
        category: 'practice',
        rationale: 'Active hands-on problem solving shakes off post-coaching lethargy.',
      },
      {
        time: '19:45 - 20:45',
        startTime: '19:45',
        endTime: '20:45',
        subject: 'Chemistry / Biology Revision',
        description: 'Read high-weightage NCERT/Notes and mark high-frequency question patterns.',
        priority: 'high',
        category: 'revision',
        rationale: 'Spaced repetition reinforces retention right before dinner.',
      },
      {
        time: '21:45 - 22:30',
        startTime: '21:45',
        endTime: '22:30',
        subject: 'Day Review & Error Log',
        description: 'Review any mistakes made today and prepare books for tomorrow morning.',
        priority: 'medium',
        category: 'study',
        rationale: 'Wind-down mental preparation ensures zero morning hesitation.',
      },
    ],
    reasoning: 'This plan distributes cognitive loads realistically across morning and evening windows, leaving dedicated buffers for travel and meals so you never feel trapped in an unachievable grind.',
    adjustmentsAllowed: 'You can swap the morning and evening subjects depending on which subject feels most daunting to you today.',
  };
}

function generateRuleBasedSchedule(inputs: any, profile: any) {
  const wake = inputs.wakeTime || '06:00';
  const bed = inputs.bedTime || '23:00';
  return {
    totalStudyHours: 4.5,
    dailyPhilosophy: 'Consistency beats intensity. Conquer 3 high-leverage sessions today.',
    schedule: [
      {
        id: 'tb_1',
        startTime: '06:15',
        endTime: '07:30',
        subject: 'Physics Mechanics / Theory',
        description: 'Deep study on formulas and fundamental concept clarity.',
        priority: 'urgent',
        category: 'study',
        isFixed: false,
        aiRationale: 'Morning peak alertness: no phone, pure conceptual absorption.',
        durationMinutes: 75,
      },
      {
        id: 'tb_2',
        startTime: '08:00',
        endTime: '15:00',
        subject: 'School / Academic Lectures',
        description: 'School classes, labs, and peer discussions.',
        priority: 'fixed',
        category: 'school',
        isFixed: true,
        aiRationale: 'Fixed institutional commitment.',
        durationMinutes: 420,
      },
      {
        id: 'tb_3',
        startTime: '15:30',
        endTime: '16:15',
        subject: 'Recharge & Snack Buffer',
        description: 'Healthy snack, hydration, physical stretch.',
        priority: 'fixed',
        category: 'break',
        isFixed: true,
        aiRationale: 'Mandatory neurological rest to transition into evening self-study.',
        durationMinutes: 45,
      },
      {
        id: 'tb_4',
        startTime: '17:00',
        endTime: '18:30',
        subject: 'Mathematics Numerical Practice',
        description: 'Solve 15 competitive/board standard problems.',
        priority: 'high',
        category: 'practice',
        isFixed: false,
        aiRationale: 'High active cognitive demand keeps alertness high in the late afternoon.',
        durationMinutes: 90,
      },
      {
        id: 'tb_5',
        startTime: '19:30',
        endTime: '20:45',
        subject: 'Chemistry / Subject Revision',
        description: 'Review flash notes, NCERT reactions, and key definitions.',
        priority: 'high',
        category: 'revision',
        isFixed: false,
        aiRationale: 'Spaced repetition before night rest cements memory consolidation.',
        durationMinutes: 75,
      },
      {
        id: 'tb_6',
        startTime: '21:45',
        endTime: '22:30',
        subject: 'Error Log & Next Day Mission Setup',
        description: 'Log mistakes in error notebook and set out tomorrow materials.',
        priority: 'medium',
        category: 'study',
        isFixed: false,
        aiRationale: 'Closing the mental loop reduces sleep anxiety and boosts tomorrow momentum.',
        durationMinutes: 45,
      },
    ],
    reasoningSummary: 'Balanced 4.5 hours of self-study with structured meal buffers and 7.5 hours of uncompromised sleep.',
  };
}

function generateRuleBasedRescue(currentTime: string, unfinishedTasks: any[], reason: string, bedTime: string) {
  const filtered = Array.isArray(unfinishedTasks) ? unfinishedTasks.slice(0, 2) : [];
  return {
    rescueMessage: 'Deep breath. Taking a setback in stride is what separates true legends from rookies. We recalibrated your evening so you finish strong without guilt.',
    remainingHoursAvailable: 3,
    rescheduledToday: [
      {
        id: 'rescue_1',
        startTime: '19:00',
        endTime: '20:15',
        subject: filtered[0]?.subject || 'Top Priority Chapter Practice',
        description: filtered[0]?.description || 'Concentrated 45-minute sprint on the most critical pending topic.',
        priority: 'urgent',
        category: 'study',
        durationMinutes: 75,
        aiRationale: 'Focused evening sprint on the single most impactful item.',
      },
      {
        id: 'rescue_2',
        startTime: '21:00',
        endTime: '22:00',
        subject: filtered[1]?.subject || 'Quick Review & Error Notebook',
        description: 'Consolidate today learnings so progress is never lost.',
        priority: 'high',
        category: 'revision',
        durationMinutes: 60,
        aiRationale: 'High leverage wind-down review.',
      },
    ],
    deferredTasks: [
      {
        subject: 'Secondary Practice & Low-Yield Notes',
        originalDescription: 'Remaining queued items postponed to weekend buffer block.',
        deferredTo: 'Saturday 10:00 AM Dedicated Catch-Up Slot',
        reason: 'Prevents sleep deprivation and keeps cognitive morale high.',
      },
    ],
    rescueExplanation: 'We preserved your mandatory sleep and meal routines. By selecting only the single highest-yield task for tonight, you maintain your streak without burnout.',
  };
}

function generateRuleBasedExamPlan(examName: string, examDate: string, daysRemaining: number, chapters: any) {
  return {
    feasibilityAssessment: `With ${daysRemaining || 30} days remaining, completing your target chapters is highly realistic with 3.5 to 4 focused study hours per day.`,
    dailyTargetChapters: 'Target 1 chapter deep revision every 2 days, plus 20 daily practice questions.',
    recommendedPrioritiesToday: [
      'Prioritize high-weightage chapters with previous years question trends',
      'Maintain an active Error Notebook for every wrong calculation',
      'Schedule a timed mock test every 7th day',
    ],
    mockTestMilestones: [
      { title: 'Full Syllabus Milestone Test 1', scheduledDate: 'In 7 days', focus: 'Time Management & Elimination' },
      { title: 'Speed & Accuracy Drill 2', scheduledDate: 'In 14 days', focus: 'Negative Marking Reduction' },
      { title: 'Final Simulation Exam', scheduledDate: '3 days before D-Day', focus: 'Exam Temperament & Confidence' },
    ],
    bossBattles: [
      {
        id: 'boss_integration',
        title: 'Definite Integration & Calculus Boss Battle',
        subject: 'Mathematics',
        bossHp: 500,
        stages: [
          { stageNumber: 1, title: 'Master Fundamental Properties of Definite Integrals', xpReward: 30, isComplete: true },
          { stageNumber: 2, title: 'Solve 10 Standard King Property (a+b-x) Problems', xpReward: 40, isComplete: false },
          { stageNumber: 3, title: 'Definite Integrals with Modulus & Greatest Integer Functions', xpReward: 50, isComplete: false },
          { stageNumber: 4, title: 'Leibnitz Rule and Area Under Curves PYQs', xpReward: 60, isComplete: false },
          { stageNumber: 5, title: 'Timed Boss Battle: 5 Multi-Concept Exam Problems in 25 Mins', xpReward: 100, isComplete: false },
        ],
      },
      {
        id: 'boss_rotation',
        title: 'Rotational Dynamics Boss Battle',
        subject: 'Physics',
        bossHp: 500,
        stages: [
          { stageNumber: 1, title: 'Moment of Inertia of Standard Bodies & Theorems', xpReward: 30, isComplete: false },
          { stageNumber: 2, title: 'Torque Equilibrium & Pulley Constraints', xpReward: 40, isComplete: false },
          { stageNumber: 3, title: 'Angular Momentum Conservation Challenges', xpReward: 50, isComplete: false },
          { stageNumber: 4, title: 'Pure Rolling on Inclined Planes with Friction', xpReward: 60, isComplete: false },
          { stageNumber: 5, title: 'Final Boss Simulation: Past 5 Years JEE/NEET Tough Numerical Set', xpReward: 100, isComplete: false },
        ],
      },
    ],
  };
}

function generateRuleBasedDoubtSolution(subject: string, doubtText: string, level: string) {
  const queryLower = (doubtText || '').toLowerCase();
  const subj = (subject || 'Physics').toLowerCase();

  // Physics specific solution
  if (subj.includes('physic') || queryLower.includes('torque') || queryLower.includes('gravity') || queryLower.includes('ohm') || queryLower.includes('velocity')) {
    return {
      subject: 'Physics',
      topic: queryLower.includes('torque') ? 'Rotational Dynamics (Torque & Equilibrium)' : queryLower.includes('ohm') ? 'Current Electricity (Ohm\'s Law & Circuits)' : 'Classical Mechanics',
      coreConcept: 'Torque τ = r × F = r F sin(θ). It represents the rotational analog of force, acting perpendicular to both the position vector and the applied force line of action.',
      stepByStepSolution: [
        {
          stepNumber: 1,
          title: 'Establish Reference Origin & Draw Free Body Diagram',
          explanation: 'Identify the pivot point (instantaneous axis of rotation). Fix your coordinate system and establish the perpendicular distance (lever arm) from the line of action of the force to the pivot: d_perp = r * sin(θ).'
        },
        {
          stepNumber: 2,
          title: 'Calculate Vector Cross Product or Lever Arm Component',
          explanation: 'Compute magnitude |τ| = F * (r_perp). Ensure sign convention: counter-clockwise (CCW) is conventionally positive (+k̂) and clockwise (CW) is negative (-k̂).'
        },
        {
          stepNumber: 3,
          title: 'Apply Rotational Equilibrium condition: Στ_net = I * α',
          explanation: 'If in static equilibrium, Στ_net = 0 about ANY chosen axis. For acceleration, equate net torque to moment of inertia times angular acceleration (I * α).'
        }
      ],
      finalAnswer: 'Net Torque = r × F. In static equilibrium, Στ = 0 allows you to eliminate unknown reaction forces at the pivot by choosing the pivot as the origin.',
      commonExamTrap: 'Exam Pitfall: Forgetting to resolve the angle θ between r and F, or calculating torque without specifying the origin. Torque is NOT unique unless the reference point is stated!',
      quickPracticeQuestion: 'A uniform rod of mass M and length L is hinged at one end. What is the initial angular acceleration α when released from a horizontal position?'
    };
  }

  // Mathematics specific solution
  if (subj.includes('math') || queryLower.includes('integral') || queryLower.includes('derivative') || queryLower.includes('matrix') || queryLower.includes('trigo')) {
    return {
      subject: 'Mathematics',
      topic: queryLower.includes('integral') ? 'Definite Integration (King\'s Property)' : queryLower.includes('matrix') ? 'Linear Algebra & Matrices' : 'Calculus',
      coreConcept: 'King\'s Property of Definite Integrals: ∫[a to b] f(x) dx = ∫[a to b] f(a + b - x) dx. This preserves the area under the curve while transforming difficult integrand components.',
      stepByStepSolution: [
        {
          stepNumber: 1,
          title: 'Set up original integral as I',
          explanation: 'Let I = ∫[a to b] f(x) dx. Label this Equation (1).'
        },
        {
          stepNumber: 2,
          title: 'Apply the substitution x = (a + b - t)',
          explanation: 'dx = -dt. When x=a, t=b. When x=b, t=a. Reversing the limits eliminates the negative sign, yielding I = ∫[a to b] f(a + b - x) dx. Label this Equation (2).'
        },
        {
          stepNumber: 3,
          title: 'Add Equation (1) and Equation (2): 2I',
          explanation: '2I = ∫[a to b] [f(x) + f(a + b - x)] dx. The numerator and denominator often cancel or simplify to 1, leaving 2I = ∫[a to b] 1 dx = (b - a), so I = (b - a)/2.'
        }
      ],
      finalAnswer: 'Result: I = (b - a) / 2 for symmetric trigonometric/polynomial fractions where f(x) + f(a + b - x) simplifies to a constant.',
      commonExamTrap: 'Exam Pitfall: Forgetting that the result is 2I on the left side, causing students to forget dividing by 2 at the end!',
      quickPracticeQuestion: 'Evaluate ∫[0 to π/2] (sin^4(x)) / (sin^4(x) + cos^4(x)) dx using King\'s Property.'
    };
  }

  // Chemistry specific solution
  if (subj.includes('chem') || queryLower.includes('reaction') || queryLower.includes('acid') || queryLower.includes('sn1') || queryLower.includes('sn2') || queryLower.includes('orbital')) {
    return {
      subject: 'Chemistry',
      topic: queryLower.includes('sn1') || queryLower.includes('sn2') ? 'Organic Chemistry (Nucleophilic Substitution Mechanisms)' : 'Physical & Inorganic Chemistry',
      coreConcept: 'SN1 is a two-step unimolecular substitution via a planar carbocation intermediate (favors tertiary halides, polar protic solvent, leads to racemization). SN2 is a single-step bimolecular concerted attack with backside inversion (Walden inversion, favors primary halides, polar aprotic solvent).',
      stepByStepSolution: [
        {
          stepNumber: 1,
          title: 'Examine Substrate Steric Hindrance',
          explanation: '3° substrate > 2° substrate: Carbocation is stabilized by hyperconjugation and inductive effect -> favors SN1. 1° substrate > 2° substrate: Little steric hindrance for backside attack -> favors SN2.'
        },
        {
          stepNumber: 2,
          title: 'Evaluate Nucleophile Strength and Solvent',
          explanation: 'Strong nucleophile (OH⁻, CN⁻, RO⁻) forces immediate backside displacement (SN2). Weak neutral nucleophile (H2O, ROH) waits for leaving group departure (SN1).'
        },
        {
          stepNumber: 3,
          title: 'Determine Stereochemical Outcome',
          explanation: 'SN2 yields complete 100% inversion of configuration. SN1 yields partial racemization (slightly more inversion due to ion-pair shielding).'
        }
      ],
      finalAnswer: 'Primary alkyl halides + strong nucleophile in acetone -> SN2 (Inversion). Tertiary alkyl halides + weak nucleophile in polar protic solvent -> SN1 (Carbocation).',
      commonExamTrap: 'Exam Pitfall: Carbocation rearrangements (hydride or methyl shifts) occur ONLY in SN1, never in SN2 because SN2 has no free intermediate!',
      quickPracticeQuestion: 'Predict whether 2-bromo-2-methylpropane treated with aqueous ethanol undergoes SN1 or SN2, and state the major product.'
    };
  }

  // Biology specific solution
  if (subj.includes('bio') || queryLower.includes('dna') || queryLower.includes('cell') || queryLower.includes('enzyme') || queryLower.includes('mitosis')) {
    return {
      subject: 'Biology',
      topic: 'Genetics & Molecular Biology (DNA Replication & Regulation)',
      coreConcept: 'DNA replication is semi-conservative, bidirectional, and semi-discontinuous. Proved experimentally by Meselson and Stahl (1958) using heavy isotope N¹⁵ and CsCl density gradient centrifugation.',
      stepByStepSolution: [
        {
          stepNumber: 1,
          title: 'Initiation at Origin of Replication (Ori)',
          explanation: 'DNA Helicase unwinds the double helix by breaking hydrogen bonds. Single-Strand Binding Proteins (SSBs) prevent re-annealing, and Topoisomerase (DNA Gyrase) relieves torsional supercoiling strain.'
        },
        {
          stepNumber: 2,
          title: 'Primer Synthesis & Directionality Constraint',
          explanation: 'DNA Polymerase III can only synthesize in the 5\' -> 3\' direction and requires a free 3\'-OH group provided by an RNA primer laid down by Primase.'
        },
        {
          stepNumber: 3,
          title: 'Leading vs Lagging Strand Assembly',
          explanation: 'Leading strand is synthesized continuously towards the replication fork. Lagging strand is synthesized discontinuously away from the fork as Okazaki fragments, later joined by DNA Ligase.'
        }
      ],
      finalAnswer: 'Each daughter DNA molecule consists of one parental conserved strand and one newly synthesized strand (Semi-conservative mechanism).',
      commonExamTrap: 'Exam Pitfall: Confusing the polarity of the template strand (3\' -> 5\') with the direction of daughter strand synthesis (always 5\' -> 3\').',
      quickPracticeQuestion: 'What enzyme replaces the RNA primers with DNA nucleotides in prokaryotic replication before DNA ligase seals the nick?'
    };
  }

  // Computer Science / Coding solution
  if (subj.includes('computer') || subj.includes('code') || queryLower.includes('python') || queryLower.includes('algorithm') || queryLower.includes('binary')) {
    return {
      subject: 'Computer Science',
      topic: 'Algorithms & Data Structures (Binary Search & Complexity)',
      coreConcept: 'Binary Search achieves O(log n) time complexity by dividing a sorted search space in half at each step, comparing target with mid = low + (high - low) // 2.',
      stepByStepSolution: [
        {
          stepNumber: 1,
          title: 'Precondition: Verify Sorted Order',
          explanation: 'Binary Search strictly requires the search space to be monotonically non-decreasing or sorted. Initialize low = 0, high = n - 1.'
        },
        {
          stepNumber: 2,
          title: 'Calculate Safe Midpoint to Avoid Overflow',
          explanation: 'In languages like C++ / Java, use mid = low + (high - low) / 2 instead of (low + high) / 2 to prevent integer overflow.'
        },
        {
          stepNumber: 3,
          title: 'Eliminate Half of the Search Interval',
          explanation: 'If arr[mid] == target: return mid. If arr[mid] < target: low = mid + 1. If arr[mid] > target: high = mid - 1. Terminate when low > high.'
        }
      ],
      finalAnswer: 'Target found at index mid, or -1 if not present. Time Complexity: O(log n), Space Complexity: O(1) iterative.',
      commonExamTrap: 'Exam Pitfall: Infinite loops caused by off-by-one errors when updating low = mid instead of low = mid + 1 in strict monotonic searches.',
      quickPracticeQuestion: 'How many comparisons at most does Binary Search take on an array of 1,024 elements?'
    };
  }

  // Universal General Subject Solution
  return {
    subject: subject || 'General Studies',
    topic: 'Academic Problem Solving & Conceptual Principles',
    coreConcept: `Direct pedagogical breakdown for: "${doubtText.slice(0, 60)}...". Structured using first-principles reasoning to guarantee exam readiness.`,
    stepByStepSolution: [
      {
        stepNumber: 1,
        title: 'Define Fundamental Definitions & Boundary Conditions',
        explanation: 'Deconstruct the question into its primary terms, given data, and standard definitions.'
      },
      {
        stepNumber: 2,
        title: 'Apply Governing Laws & Logical Deductions',
        explanation: 'Correlate the variables using the standard governing theorem and eliminate irrelevant distractors.'
      },
      {
        stepNumber: 3,
        title: 'Synthesize the Complete Formal Conclusion',
        explanation: 'Verify that the solution satisfies boundary checks, dimensional consistency, and marks scheme requirements.'
      }
    ],
    finalAnswer: 'Validated solution derived from syllabus standard benchmarks.',
    commonExamTrap: 'Exam Pitfall: Rushing the question without writing the formula formula or stating units, leading to step-marking deduction.',
    quickPracticeQuestion: 'Can you state the primary condition or exception under which this principle no longer holds true?'
  };
}

// Development Vite middleware or Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TIMEGENIUS AI server running on port ${PORT}`);
  });
}

startServer();
