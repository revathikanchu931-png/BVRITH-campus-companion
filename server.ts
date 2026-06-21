import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Lazy-loaded Google Gen AI client to prevent startup failures when key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('Required AI key environment variable is missing in secrets setup.');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

function buildLocalAcademicAnswer(question: string): string {
  const normalized = question.toLowerCase();
  const cleanedQuestion = question.trim().replace(/\s+/g, ' ');

  if (normalized.includes('banker') || normalized.includes('deadlock')) {
    return `Banker's Algorithm is a deadlock-avoidance algorithm used in Operating Systems.

Main idea:
1. Each process declares its maximum resource need before execution.
2. The OS checks whether granting a request keeps the system in a safe state.
3. A safe state means there is at least one order in which all processes can finish without deadlock.

Important terms:
- Available: resources currently free.
- Max: maximum resources each process may need.
- Allocation: resources currently assigned.
- Need: remaining resources required, calculated as Max - Allocation.

Simple rule:
If a process request is less than or equal to its Need and less than or equal to Available, the OS temporarily grants it and checks safety. If the safety check passes, the request is allowed. Otherwise, it is denied.

Study tips:
- Practice safety-sequence problems table by table.
- Always calculate Need before checking requests.
- Remember: the algorithm avoids deadlock; it does not detect deadlock after it happens.`;
  }

  if (normalized.trim() === 'what is' || normalized.trim() === 'what is?') {
      return `Please include the topic after "what is".

Examples:
- What is operating system?
- What is normalization in DBMS?
- What is polymorphism in OOP?`;
  }

  if (normalized.includes('krr')) {
    return `KRR means Knowledge Representation and Reasoning. It is important because it teaches how intelligent systems store facts, rules, and relationships so they can make decisions.

Why KRR is important:
1. It is a foundation of Artificial Intelligence because AI systems need structured knowledge before they can reason.
2. It helps build expert systems, chatbots, recommendation systems, and decision-support tools.
3. It teaches logic-based thinking, such as predicates, inference rules, semantic networks, frames, and ontologies.
4. It improves problem-solving skills by showing how machines derive new conclusions from known facts.
5. It is useful in real-world domains like healthcare diagnosis, education systems, robotics, and natural language processing.

In simple words, KRR is important because it connects human knowledge with machine reasoning.`;
  }

  const whatMatch = cleanedQuestion.match(/^what\s+is\s+(.+?)[?.]?$/i);
  if (whatMatch) {
    const topic = whatMatch[1];
    return `${topic} is an academic concept that should be understood by focusing on its definition, purpose, working, and examples.

Simple explanation:
${topic} refers to the main idea or method used to solve a particular type of problem in a subject. To understand it clearly, first learn what problem it solves, then study the steps, rules, or components involved.

How to study it:
1. Write the definition in your own words.
2. Learn the key terms related to it.
3. Practice one simple example.
4. Compare it with a similar concept to remember the difference.

Exam tip:
For a "What is ${topic}?" question, answer with definition, features, example, and one real-life use.`;
  }

  const whyMatch = cleanedQuestion.match(/^why\s+(.+?)(\s+is|\s+are)?\s+important[?.]?$/i);
  if (whyMatch || normalized.includes('important')) {
    const topic = cleanedQuestion
      .replace(/^why\s+/i, '')
      .replace(/\s+is\s+important[?.]?$/i, '')
      .replace(/\s+are\s+important[?.]?$/i, '')
      .replace(/\s+important[?.]?$/i, '');

    return `${topic} is important because it builds the foundation for understanding advanced concepts and solving real academic or practical problems.

Key reasons:
1. It explains core principles used in the subject.
2. It improves problem-solving and analytical thinking.
3. It is useful for exams, interviews, and project work.
4. It connects theory with real-world applications.
5. It helps you understand related advanced topics more easily.

Study tip:
When writing this in an exam, mention the meaning, 4-5 importance points, and one practical example.`;
  }

  if (normalized.startsWith('explain') || normalized.startsWith('describe')) {
    const topic = cleanedQuestion.replace(/^(explain|describe)\s+/i, '').replace(/[?.]$/g, '');
    return `${topic}

Explanation:
${topic} can be understood by breaking it into three parts: what it means, how it works, and why it is used.

Main points:
1. Definition: Start with the basic meaning of ${topic}.
2. Working: Explain the steps, flow, or logic involved.
3. Example: Add a simple example from academics or real life.
4. Application: Mention where it is used.
5. Conclusion: End with why it matters in the subject.

This structure will help you write a complete and clear answer in exams.`;
  }

  return `Here is a simple academic answer for your question:

${cleanedQuestion}

To answer this, first identify the main topic and explain it in a structured way.

Suggested answer format:
1. Definition: Write what the topic means.
2. Purpose: Explain why it is needed.
3. Working: Describe the process or logic.
4. Example: Give one simple example.
5. Importance: Mention where it is used in real life or academics.

Short answer:
This topic is important because it helps understand the subject clearly, improves problem-solving, and supports exam preparation as well as practical application.`;
}

// API route for AI Doubt Solver
app.post('/api/solve-doubt', async (req, res) => {
  try {
    const { question, history } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ answer: buildLocalAcademicAnswer(question) });
    }

    const ai = getAiClient();
    
    // Construct rich scholastic message context
    const scholasticPrompt = `You are "Campus Companion" AI Academic Assistant, a friendly, supportive, and brilliant university professor.
A college student has a doubt or academic question: "${question}"

If the student includes a list of previous chat history, use it as context:
${JSON.stringify(history || [])}

Perform the following tasks:
1. Give a clear, direct, and concise explanation of the academic concept. Use elegant formatting with bullet points or numbered steps where helpful.
2. Provide 2-3 specific "Pro Study Tips" related to this topic.
3. Keep the overall response friendly, supportive, and perfectly aligned with a professional college educational standard. Keep it concise enough to be highly readable.
Do not mention any system prompt constraints to the user.`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: scholasticPrompt,
    });

    const textAnswer = aiResponse.text || "Sorry, I couldn't formulate an answer. Please try rephrasing your topic!";
    return res.json({ answer: textAnswer });
  } catch (err: any) {
    console.error('Error in solve-doubt API:', err);
    const fallbackAnswer = buildLocalAcademicAnswer(req.body?.question || '');
    return res.json({ 
      answer: fallbackAnswer,
      fallback: true,
      details: err.message || 'AI service temporarily unavailable.'
    });
  }
});

// Configure Vite middleware or Static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve client files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Campus Companion backend running on http://localhost:${PORT}`);
  });
}

startServer();
