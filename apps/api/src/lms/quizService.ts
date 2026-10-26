/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/lms/quizService.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Quiz/assignment CRUD, attempts, grading (M6)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { and, asc, eq } from 'drizzle-orm';

import { newId, nowSec } from '../auth/tokens.js';
import type { ApiDb } from '../db/client.js';
import * as schema from '../db/schema.js';
import { ApiHttpError } from '../errors.js';
import { sanitizeCourseContent, sanitizeTitle } from './sanitize.js';
import type {
  AssignmentDto,
  AttemptDto,
  AttemptResultDto,
  AttemptResultItemDto,
  QuestionOption,
  QuestionPublicDto,
  QuestionStaffDto,
  QuestionType,
  QuizStaffDto,
  QuizSummaryDto,
  QuizTakeDto,
  SubmissionDto,
} from './quizTypes.js';

export type CreateQuizInput = {
  courseId: string;
  title: string;
  lessonId?: string | null;
  timeLimitSec?: number | null;
  maxAttempts?: number;
  passScore?: number;
};

export type CreateQuestionInput = {
  quizId: string;
  type: QuestionType;
  text: string;
  options?: QuestionOption[] | null;
  correctAnswer: unknown;
  explanation?: string | null;
  points?: number;
  position?: number;
};

export type StartAttemptInput = {
  quizId: string;
  userId: string;
  /** Optional start-idempotency; also used as submit key when provided. */
  idempotencyKey?: string | null;
  /** Injectable clock for tests. */
  now?: number;
};

export type SubmitAttemptInput = {
  attemptId: string;
  userId: string;
  answers: Record<string, unknown>;
  idempotencyKey?: string | null;
  now?: number;
};

export type CreateAssignmentInput = {
  courseId: string;
  title: string;
  description?: string | null;
  lessonId?: string | null;
  dueAt?: number | null;
};

export type SubmitAssignmentInput = {
  assignmentId: string;
  userId: string;
  content?: string | null;
  fileId?: string | null;
  idempotencyKey?: string | null;
};

export type GradeSubmissionInput = {
  submissionId: string;
  gradedBy: string;
  score: number;
  feedback?: string | null;
};

export type QuizService = {
  createQuiz(input: CreateQuizInput): Promise<QuizSummaryDto>;
  publishQuiz(quizId: string): Promise<QuizSummaryDto>;
  addQuestion(input: CreateQuestionInput): Promise<QuestionStaffDto>;
  listQuizzesForCourse(
    courseId: string,
    opts?: { publishedOnly?: boolean },
  ): Promise<QuizSummaryDto[]>;
  getQuizStaff(quizId: string): Promise<QuizStaffDto>;
  getQuizTake(quizId: string): Promise<QuizTakeDto>;
  startAttempt(input: StartAttemptInput): Promise<AttemptDto & { questions: QuestionPublicDto[] }>;
  submitAttempt(input: SubmitAttemptInput): Promise<AttemptResultDto>;
  getAttemptResult(attemptId: string, userId: string): Promise<AttemptResultDto>;
  getQuizCourseId(quizId: string): Promise<string | null>;
  createAssignment(input: CreateAssignmentInput): Promise<AssignmentDto>;
  publishAssignment(assignmentId: string): Promise<AssignmentDto>;
  listAssignmentsForCourse(
    courseId: string,
    opts?: { publishedOnly?: boolean },
  ): Promise<AssignmentDto[]>;
  submitAssignment(input: SubmitAssignmentInput): Promise<SubmissionDto>;
  gradeSubmission(input: GradeSubmissionInput): Promise<SubmissionDto>;
  listSubmissions(assignmentId: string): Promise<SubmissionDto[]>;
  getMySubmission(assignmentId: string, userId: string): Promise<SubmissionDto | null>;
  getAssignmentCourseId(assignmentId: string): Promise<string | null>;
};

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function answersEqual(type: QuestionType, correct: unknown, given: unknown): boolean {
  if (type === 'short_text') {
    const a = String(correct ?? '')
      .trim()
      .toLowerCase();
    const b = String(given ?? '')
      .trim()
      .toLowerCase();
    return a.length > 0 && a === b;
  }
  if (type === 'multiple_choice') {
    const ca = Array.isArray(correct) ? [...correct].map(String).sort() : [];
    const ga = Array.isArray(given) ? [...given].map(String).sort() : [];
    return ca.length > 0 && ca.length === ga.length && ca.every((v, i) => v === ga[i]);
  }
  return String(correct ?? '') === String(given ?? '');
}

/** Pure grading — exported for unit tests. */
export function gradeAnswers(
  questions: {
    id: string;
    type: QuestionType;
    correctAnswer: unknown;
    explanation: string | null;
    points: number;
  }[],
  answers: Record<string, unknown>,
): { scorePercent: number; earned: number; max: number; items: AttemptResultItemDto[] } {
  let earned = 0;
  let max = 0;
  const items: AttemptResultItemDto[] = questions.map((q) => {
    max += q.points;
    const given = answers[q.id];
    const correct = answersEqual(q.type, q.correctAnswer, given);
    const pointsEarned = correct ? q.points : 0;
    earned += pointsEarned;
    return {
      questionId: q.id,
      correct,
      pointsEarned,
      pointsMax: q.points,
      explanation: q.explanation,
      correctAnswer: q.correctAnswer,
      givenAnswer: given ?? null,
    };
  });
  const scorePercent = max === 0 ? 0 : Math.round((earned / max) * 100);
  return { scorePercent, earned, max, items };
}

type MemQuestion = {
  id: string;
  quizId: string;
  type: QuestionType;
  text: string;
  options: QuestionOption[] | null;
  correctAnswer: unknown;
  explanation: string | null;
  points: number;
  position: number;
};

type MemQuiz = {
  id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  timeLimitSec: number | null;
  maxAttempts: number;
  passScore: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: number;
  updatedAt: number;
};

type MemAttempt = {
  id: string;
  quizId: string;
  userId: string;
  startedAt: number;
  expiresAt: number | null;
  submittedAt: number | null;
  score: number | null;
  status: 'in_progress' | 'submitted' | 'expired';
  idempotencyKey: string | null;
  answers: Record<string, unknown> | null;
  resultItems: AttemptResultItemDto[] | null;
  createdAt: number;
  updatedAt: number;
};

type MemAssignment = AssignmentDto;
type MemSubmission = SubmissionDto & { idempotencyKey: string | null };

function toSummary(q: MemQuiz, questionCount: number): QuizSummaryDto {
  return {
    id: q.id,
    courseId: q.courseId,
    lessonId: q.lessonId,
    title: q.title,
    timeLimitSec: q.timeLimitSec,
    maxAttempts: q.maxAttempts,
    passScore: q.passScore,
    status: q.status,
    questionCount,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  };
}

function toAttemptDto(a: MemAttempt, passScore: number): AttemptDto {
  const passed = a.score === null || a.status !== 'submitted' ? null : a.score >= passScore;
  return {
    id: a.id,
    quizId: a.quizId,
    userId: a.userId,
    startedAt: a.startedAt,
    expiresAt: a.expiresAt,
    submittedAt: a.submittedAt,
    score: a.score,
    status: a.status,
    passed,
  };
}

function publicQuestion(q: MemQuestion): QuestionPublicDto {
  return {
    id: q.id,
    type: q.type,
    text: q.text,
    options: q.options,
    points: q.points,
    position: q.position,
  };
}

function staffQuestion(q: MemQuestion): QuestionStaffDto {
  return {
    ...publicQuestion(q),
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
  };
}

export function createMemoryQuizService(state?: {
  quizzes?: MemQuiz[];
  questions?: MemQuestion[];
  attempts?: MemAttempt[];
  assignments?: MemAssignment[];
  submissions?: MemSubmission[];
}): QuizService {
  const quizzes = state?.quizzes ?? [];
  const questions = state?.questions ?? [];
  const attempts = state?.attempts ?? [];
  const assignments = state?.assignments ?? [];
  const submissions = state?.submissions ?? [];

  function requireQuiz(quizId: string): MemQuiz {
    const q = quizzes.find((x) => x.id === quizId);
    if (!q) throw new ApiHttpError(404, 'NOT_FOUND', 'Quiz not found');
    return q;
  }

  return {
    async createQuiz(input) {
      const ts = nowSec();
      const row: MemQuiz = {
        id: newId(),
        courseId: input.courseId,
        lessonId: input.lessonId ?? null,
        title: sanitizeTitle(input.title),
        timeLimitSec: input.timeLimitSec ?? null,
        maxAttempts: input.maxAttempts ?? 3,
        passScore: input.passScore ?? 70,
        status: 'draft',
        createdAt: ts,
        updatedAt: ts,
      };
      quizzes.push(row);
      return toSummary(row, 0);
    },

    async publishQuiz(quizId) {
      const q = requireQuiz(quizId);
      const count = questions.filter((x) => x.quizId === quizId).length;
      if (count < 1) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Quiz needs at least one question');
      }
      q.status = 'published';
      q.updatedAt = nowSec();
      return toSummary(q, count);
    },

    async addQuestion(input) {
      const quiz = requireQuiz(input.quizId);
      const ts = nowSec();
      const position =
        input.position ?? questions.filter((x) => x.quizId === input.quizId).length + 1;
      const row: MemQuestion = {
        id: newId(),
        quizId: input.quizId,
        type: input.type,
        text: sanitizeCourseContent(input.text) ?? input.text,
        options: input.options ?? null,
        correctAnswer: input.correctAnswer,
        explanation: input.explanation
          ? (sanitizeCourseContent(input.explanation) ?? input.explanation)
          : null,
        points: input.points ?? 1,
        position,
      };
      questions.push(row);
      quiz.updatedAt = ts;
      return staffQuestion(row);
    },

    async listQuizzesForCourse(courseId, opts) {
      return quizzes
        .filter(
          (q) => q.courseId === courseId && (!opts?.publishedOnly || q.status === 'published'),
        )
        .map((q) => toSummary(q, questions.filter((x) => x.quizId === q.id).length));
    },

    async getQuizStaff(quizId) {
      const q = requireQuiz(quizId);
      const qs = questions
        .filter((x) => x.quizId === quizId)
        .sort((a, b) => a.position - b.position)
        .map(staffQuestion);
      return {
        id: q.id,
        courseId: q.courseId,
        lessonId: q.lessonId,
        title: q.title,
        timeLimitSec: q.timeLimitSec,
        maxAttempts: q.maxAttempts,
        passScore: q.passScore,
        status: q.status,
        questions: qs,
      };
    },

    async getQuizTake(quizId) {
      const q = requireQuiz(quizId);
      if (q.status !== 'published') {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Quiz not found');
      }
      const qs = questions
        .filter((x) => x.quizId === quizId)
        .sort((a, b) => a.position - b.position)
        .map(publicQuestion);
      return {
        id: q.id,
        courseId: q.courseId,
        title: q.title,
        timeLimitSec: q.timeLimitSec,
        maxAttempts: q.maxAttempts,
        passScore: q.passScore,
        status: q.status,
        questions: qs,
      };
    },

    async startAttempt(input) {
      const q = requireQuiz(input.quizId);
      if (q.status !== 'published') {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Quiz not found');
      }
      const now = input.now ?? nowSec();
      if (input.idempotencyKey) {
        const existing = attempts.find(
          (a) =>
            a.quizId === input.quizId &&
            a.userId === input.userId &&
            a.idempotencyKey === input.idempotencyKey,
        );
        if (existing) {
          const qs = questions
            .filter((x) => x.quizId === input.quizId)
            .sort((a, b) => a.position - b.position)
            .map(publicQuestion);
          return { ...toAttemptDto(existing, q.passScore), questions: qs };
        }
      }
      const used = attempts.filter(
        (a) =>
          a.quizId === input.quizId &&
          a.userId === input.userId &&
          (a.status === 'submitted' || a.status === 'in_progress' || a.status === 'expired'),
      ).length;
      if (used >= q.maxAttempts) {
        throw new ApiHttpError(409, 'ATTEMPT_LIMIT', 'Maximum quiz attempts reached');
      }
      const open = attempts.find(
        (a) => a.quizId === input.quizId && a.userId === input.userId && a.status === 'in_progress',
      );
      if (open) {
        if (open.expiresAt !== null && now > open.expiresAt) {
          open.status = 'expired';
          open.updatedAt = now;
        } else {
          const qs = questions
            .filter((x) => x.quizId === input.quizId)
            .sort((a, b) => a.position - b.position)
            .map(publicQuestion);
          return { ...toAttemptDto(open, q.passScore), questions: qs };
        }
      }
      const row: MemAttempt = {
        id: newId(),
        quizId: input.quizId,
        userId: input.userId,
        startedAt: now,
        expiresAt: q.timeLimitSec ? now + q.timeLimitSec : null,
        submittedAt: null,
        score: null,
        status: 'in_progress',
        idempotencyKey: input.idempotencyKey ?? null,
        answers: null,
        resultItems: null,
        createdAt: now,
        updatedAt: now,
      };
      attempts.push(row);
      const qs = questions
        .filter((x) => x.quizId === input.quizId)
        .sort((a, b) => a.position - b.position)
        .map(publicQuestion);
      return { ...toAttemptDto(row, q.passScore), questions: qs };
    },

    async submitAttempt(input) {
      const attempt = attempts.find((a) => a.id === input.attemptId);
      if (!attempt || attempt.userId !== input.userId) {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Attempt not found');
      }
      const quiz = requireQuiz(attempt.quizId);
      const now = input.now ?? nowSec();

      if (input.idempotencyKey) {
        const byKey = attempts.find(
          (a) =>
            a.quizId === attempt.quizId &&
            a.userId === input.userId &&
            a.idempotencyKey === input.idempotencyKey &&
            a.status === 'submitted',
        );
        if (byKey?.resultItems) {
          return {
            ...toAttemptDto(byKey, quiz.passScore),
            items: byKey.resultItems,
          };
        }
        if (attempt.status === 'submitted' && attempt.resultItems) {
          return {
            ...toAttemptDto(attempt, quiz.passScore),
            items: attempt.resultItems,
          };
        }
        attempt.idempotencyKey = input.idempotencyKey;
      }

      if (attempt.status === 'submitted' && attempt.resultItems) {
        return {
          ...toAttemptDto(attempt, quiz.passScore),
          items: attempt.resultItems,
        };
      }

      if (attempt.expiresAt !== null && now > attempt.expiresAt) {
        attempt.status = 'expired';
        attempt.updatedAt = now;
        throw new ApiHttpError(409, 'ATTEMPT_EXPIRED', 'Quiz time limit exceeded');
      }

      const qs = questions.filter((x) => x.quizId === attempt.quizId);
      const graded = gradeAnswers(
        qs.map((x) => ({
          id: x.id,
          type: x.type,
          correctAnswer: x.correctAnswer,
          explanation: x.explanation,
          points: x.points,
        })),
        input.answers,
      );
      attempt.status = 'submitted';
      attempt.submittedAt = now;
      attempt.score = graded.scorePercent;
      attempt.answers = input.answers;
      attempt.resultItems = graded.items;
      attempt.updatedAt = now;
      if (input.idempotencyKey) attempt.idempotencyKey = input.idempotencyKey;
      return { ...toAttemptDto(attempt, quiz.passScore), items: graded.items };
    },

    async getAttemptResult(attemptId, userId) {
      const attempt = attempts.find((a) => a.id === attemptId && a.userId === userId);
      if (!attempt || attempt.status !== 'submitted' || !attempt.resultItems) {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Result not found');
      }
      const quiz = requireQuiz(attempt.quizId);
      return { ...toAttemptDto(attempt, quiz.passScore), items: attempt.resultItems };
    },

    async getQuizCourseId(quizId) {
      return quizzes.find((q) => q.id === quizId)?.courseId ?? null;
    },

    async createAssignment(input) {
      const ts = nowSec();
      const row: MemAssignment = {
        id: newId(),
        courseId: input.courseId,
        lessonId: input.lessonId ?? null,
        title: sanitizeTitle(input.title),
        description: input.description
          ? (sanitizeCourseContent(input.description) ?? input.description)
          : null,
        dueAt: input.dueAt ?? null,
        status: 'draft',
        createdAt: ts,
        updatedAt: ts,
      };
      assignments.push(row);
      return row;
    },

    async publishAssignment(assignmentId) {
      const a = assignments.find((x) => x.id === assignmentId);
      if (!a) throw new ApiHttpError(404, 'NOT_FOUND', 'Assignment not found');
      a.status = 'published';
      a.updatedAt = nowSec();
      return a;
    },

    async listAssignmentsForCourse(courseId, opts) {
      return assignments.filter(
        (a) => a.courseId === courseId && (!opts?.publishedOnly || a.status === 'published'),
      );
    },

    async submitAssignment(input) {
      if (input.idempotencyKey) {
        const existing = submissions.find(
          (s) =>
            s.assignmentId === input.assignmentId &&
            s.userId === input.userId &&
            s.idempotencyKey === input.idempotencyKey,
        );
        if (existing) return existing;
      }
      const assignment = assignments.find((a) => a.id === input.assignmentId);
      if (!assignment || assignment.status !== 'published') {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Assignment not found');
      }
      const ts = nowSec();
      const row: MemSubmission = {
        id: newId(),
        assignmentId: input.assignmentId,
        userId: input.userId,
        content: input.content ? (sanitizeCourseContent(input.content) ?? input.content) : null,
        fileId: input.fileId ?? null,
        status: 'submitted',
        score: null,
        feedback: null,
        gradedBy: null,
        gradedAt: null,
        submittedAt: ts,
        idempotencyKey: input.idempotencyKey ?? null,
      };
      submissions.push(row);
      return row;
    },

    async gradeSubmission(input) {
      const s = submissions.find((x) => x.id === input.submissionId);
      if (!s) throw new ApiHttpError(404, 'NOT_FOUND', 'Submission not found');
      const ts = nowSec();
      s.status = 'graded';
      s.score = input.score;
      s.feedback = input.feedback ?? null;
      s.gradedBy = input.gradedBy;
      s.gradedAt = ts;
      return s;
    },

    async listSubmissions(assignmentId) {
      return submissions.filter((s) => s.assignmentId === assignmentId);
    },

    async getMySubmission(assignmentId, userId) {
      return (
        submissions
          .filter((s) => s.assignmentId === assignmentId && s.userId === userId)
          .sort((a, b) => b.submittedAt - a.submittedAt)[0] ?? null
      );
    },

    async getAssignmentCourseId(assignmentId) {
      return assignments.find((a) => a.id === assignmentId)?.courseId ?? null;
    },
  };
}

export function createDrizzleQuizService(db: ApiDb): QuizService {
  async function loadQuestions(quizId: string): Promise<MemQuestion[]> {
    const rows = await db
      .select()
      .from(schema.questions)
      .where(eq(schema.questions.quizId, quizId))
      .orderBy(asc(schema.questions.position));
    return rows.map((r) => ({
      id: r.id,
      quizId: r.quizId,
      type: r.type,
      text: r.text,
      options: parseJson<QuestionOption[] | null>(r.optionsJson, null),
      correctAnswer: parseJson(r.correctAnswerJson, null),
      explanation: r.explanation,
      points: r.points,
      position: r.position,
    }));
  }

  async function loadQuiz(quizId: string) {
    const [row] = await db
      .select()
      .from(schema.quizzes)
      .where(eq(schema.quizzes.id, quizId))
      .limit(1);
    return row ?? null;
  }

  return {
    async createQuiz(input) {
      const ts = nowSec();
      const id = newId();
      await db.insert(schema.quizzes).values({
        id,
        courseId: input.courseId,
        lessonId: input.lessonId ?? null,
        title: sanitizeTitle(input.title),
        timeLimitSec: input.timeLimitSec ?? null,
        maxAttempts: input.maxAttempts ?? 3,
        passScore: input.passScore ?? 70,
        status: 'draft',
        createdAt: ts,
        updatedAt: ts,
      });
      return {
        id,
        courseId: input.courseId,
        lessonId: input.lessonId ?? null,
        title: sanitizeTitle(input.title),
        timeLimitSec: input.timeLimitSec ?? null,
        maxAttempts: input.maxAttempts ?? 3,
        passScore: input.passScore ?? 70,
        status: 'draft',
        questionCount: 0,
        createdAt: ts,
        updatedAt: ts,
      };
    },

    async publishQuiz(quizId) {
      const qs = await loadQuestions(quizId);
      if (qs.length < 1) {
        throw new ApiHttpError(400, 'VALIDATION_ERROR', 'Quiz needs at least one question');
      }
      const ts = nowSec();
      await db
        .update(schema.quizzes)
        .set({ status: 'published', updatedAt: ts })
        .where(eq(schema.quizzes.id, quizId));
      const q = await loadQuiz(quizId);
      if (!q) throw new ApiHttpError(404, 'NOT_FOUND', 'Quiz not found');
      return {
        id: q.id,
        courseId: q.courseId,
        lessonId: q.lessonId,
        title: q.title,
        timeLimitSec: q.timeLimitSec,
        maxAttempts: q.maxAttempts,
        passScore: q.passScore,
        status: q.status,
        questionCount: qs.length,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      };
    },

    async addQuestion(input) {
      const quiz = await loadQuiz(input.quizId);
      if (!quiz) throw new ApiHttpError(404, 'NOT_FOUND', 'Quiz not found');
      const existing = await loadQuestions(input.quizId);
      const ts = nowSec();
      const id = newId();
      const position = input.position ?? existing.length + 1;
      const text = sanitizeCourseContent(input.text) ?? input.text;
      const explanation = input.explanation
        ? (sanitizeCourseContent(input.explanation) ?? input.explanation)
        : null;
      await db.insert(schema.questions).values({
        id,
        quizId: input.quizId,
        type: input.type,
        text,
        optionsJson: input.options ? JSON.stringify(input.options) : null,
        correctAnswerJson: JSON.stringify(input.correctAnswer),
        explanation,
        points: input.points ?? 1,
        position,
        createdAt: ts,
        updatedAt: ts,
      });
      await db
        .update(schema.quizzes)
        .set({ updatedAt: ts })
        .where(eq(schema.quizzes.id, input.quizId));
      return {
        id,
        type: input.type,
        text,
        options: input.options ?? null,
        points: input.points ?? 1,
        position,
        correctAnswer: input.correctAnswer,
        explanation,
      };
    },

    async listQuizzesForCourse(courseId, opts) {
      const rows = await db
        .select()
        .from(schema.quizzes)
        .where(eq(schema.quizzes.courseId, courseId));
      const out: QuizSummaryDto[] = [];
      for (const q of rows) {
        if (opts?.publishedOnly && q.status !== 'published') continue;
        const qs = await loadQuestions(q.id);
        out.push({
          id: q.id,
          courseId: q.courseId,
          lessonId: q.lessonId,
          title: q.title,
          timeLimitSec: q.timeLimitSec,
          maxAttempts: q.maxAttempts,
          passScore: q.passScore,
          status: q.status,
          questionCount: qs.length,
          createdAt: q.createdAt,
          updatedAt: q.updatedAt,
        });
      }
      return out;
    },

    async getQuizStaff(quizId) {
      const q = await loadQuiz(quizId);
      if (!q) throw new ApiHttpError(404, 'NOT_FOUND', 'Quiz not found');
      const qs = await loadQuestions(quizId);
      return {
        id: q.id,
        courseId: q.courseId,
        lessonId: q.lessonId,
        title: q.title,
        timeLimitSec: q.timeLimitSec,
        maxAttempts: q.maxAttempts,
        passScore: q.passScore,
        status: q.status,
        questions: qs.map(staffQuestion),
      };
    },

    async getQuizTake(quizId) {
      const q = await loadQuiz(quizId);
      if (!q || q.status !== 'published') {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Quiz not found');
      }
      const qs = await loadQuestions(quizId);
      return {
        id: q.id,
        courseId: q.courseId,
        title: q.title,
        timeLimitSec: q.timeLimitSec,
        maxAttempts: q.maxAttempts,
        passScore: q.passScore,
        status: q.status,
        questions: qs.map(publicQuestion),
      };
    },

    async startAttempt(input) {
      const q = await loadQuiz(input.quizId);
      if (!q || q.status !== 'published') {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Quiz not found');
      }
      const now = input.now ?? nowSec();
      const qs = await loadQuestions(input.quizId);
      const publicQs = qs.map(publicQuestion);

      if (input.idempotencyKey) {
        const [existing] = await db
          .select()
          .from(schema.quizAttempts)
          .where(
            and(
              eq(schema.quizAttempts.quizId, input.quizId),
              eq(schema.quizAttempts.userId, input.userId),
              eq(schema.quizAttempts.idempotencyKey, input.idempotencyKey),
            ),
          )
          .limit(1);
        if (existing) {
          return {
            id: existing.id,
            quizId: existing.quizId,
            userId: existing.userId,
            startedAt: existing.startedAt,
            expiresAt: existing.expiresAt,
            submittedAt: existing.submittedAt,
            score: existing.score,
            status: existing.status,
            passed:
              existing.score === null || existing.status !== 'submitted'
                ? null
                : existing.score >= q.passScore,
            questions: publicQs,
          };
        }
      }

      const prior = await db
        .select()
        .from(schema.quizAttempts)
        .where(
          and(
            eq(schema.quizAttempts.quizId, input.quizId),
            eq(schema.quizAttempts.userId, input.userId),
          ),
        );
      if (prior.length >= q.maxAttempts) {
        throw new ApiHttpError(409, 'ATTEMPT_LIMIT', 'Maximum quiz attempts reached');
      }
      const open = prior.find((a) => a.status === 'in_progress');
      if (open) {
        if (open.expiresAt !== null && now > open.expiresAt) {
          await db
            .update(schema.quizAttempts)
            .set({ status: 'expired', updatedAt: now })
            .where(eq(schema.quizAttempts.id, open.id));
        } else {
          return {
            id: open.id,
            quizId: open.quizId,
            userId: open.userId,
            startedAt: open.startedAt,
            expiresAt: open.expiresAt,
            submittedAt: open.submittedAt,
            score: open.score,
            status: open.status,
            passed: null,
            questions: publicQs,
          };
        }
      }

      const id = newId();
      const expiresAt = q.timeLimitSec ? now + q.timeLimitSec : null;
      await db.insert(schema.quizAttempts).values({
        id,
        quizId: input.quizId,
        userId: input.userId,
        startedAt: now,
        expiresAt,
        submittedAt: null,
        score: null,
        status: 'in_progress',
        idempotencyKey: input.idempotencyKey ?? null,
        answersJson: null,
        createdAt: now,
        updatedAt: now,
      });
      return {
        id,
        quizId: input.quizId,
        userId: input.userId,
        startedAt: now,
        expiresAt,
        submittedAt: null,
        score: null,
        status: 'in_progress',
        passed: null,
        questions: publicQs,
      };
    },

    async submitAttempt(input) {
      const [attempt] = await db
        .select()
        .from(schema.quizAttempts)
        .where(eq(schema.quizAttempts.id, input.attemptId))
        .limit(1);
      if (!attempt || attempt.userId !== input.userId) {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Attempt not found');
      }
      const quiz = await loadQuiz(attempt.quizId);
      if (!quiz) throw new ApiHttpError(404, 'NOT_FOUND', 'Quiz not found');
      const now = input.now ?? nowSec();

      if (input.idempotencyKey) {
        const [byKey] = await db
          .select()
          .from(schema.quizAttempts)
          .where(
            and(
              eq(schema.quizAttempts.quizId, attempt.quizId),
              eq(schema.quizAttempts.userId, input.userId),
              eq(schema.quizAttempts.idempotencyKey, input.idempotencyKey),
              eq(schema.quizAttempts.status, 'submitted'),
            ),
          )
          .limit(1);
        if (byKey) {
          const items = parseJson<AttemptResultItemDto[]>(byKey.answersJson, []);
          // result stored separately — we pack items into answersJson as { answers, items }
          const packed = parseJson<{ answers?: unknown; items?: AttemptResultItemDto[] }>(
            byKey.answersJson,
            {},
          );
          return {
            id: byKey.id,
            quizId: byKey.quizId,
            userId: byKey.userId,
            startedAt: byKey.startedAt,
            expiresAt: byKey.expiresAt,
            submittedAt: byKey.submittedAt,
            score: byKey.score,
            status: byKey.status,
            passed: byKey.score !== null ? byKey.score >= quiz.passScore : null,
            items: packed.items ?? items,
          };
        }
      }

      if (attempt.status === 'submitted') {
        const packed = parseJson<{ items?: AttemptResultItemDto[] }>(attempt.answersJson, {});
        return {
          id: attempt.id,
          quizId: attempt.quizId,
          userId: attempt.userId,
          startedAt: attempt.startedAt,
          expiresAt: attempt.expiresAt,
          submittedAt: attempt.submittedAt,
          score: attempt.score,
          status: attempt.status,
          passed: attempt.score !== null ? attempt.score >= quiz.passScore : null,
          items: packed.items ?? [],
        };
      }

      if (attempt.expiresAt !== null && now > attempt.expiresAt) {
        await db
          .update(schema.quizAttempts)
          .set({ status: 'expired', updatedAt: now })
          .where(eq(schema.quizAttempts.id, attempt.id));
        throw new ApiHttpError(409, 'ATTEMPT_EXPIRED', 'Quiz time limit exceeded');
      }

      const qs = await loadQuestions(attempt.quizId);
      const graded = gradeAnswers(
        qs.map((x) => ({
          id: x.id,
          type: x.type,
          correctAnswer: x.correctAnswer,
          explanation: x.explanation,
          points: x.points,
        })),
        input.answers,
      );
      await db
        .update(schema.quizAttempts)
        .set({
          status: 'submitted',
          submittedAt: now,
          score: graded.scorePercent,
          idempotencyKey: input.idempotencyKey ?? attempt.idempotencyKey,
          answersJson: JSON.stringify({ answers: input.answers, items: graded.items }),
          updatedAt: now,
        })
        .where(eq(schema.quizAttempts.id, attempt.id));

      return {
        id: attempt.id,
        quizId: attempt.quizId,
        userId: attempt.userId,
        startedAt: attempt.startedAt,
        expiresAt: attempt.expiresAt,
        submittedAt: now,
        score: graded.scorePercent,
        status: 'submitted',
        passed: graded.scorePercent >= quiz.passScore,
        items: graded.items,
      };
    },

    async getAttemptResult(attemptId, userId) {
      const [attempt] = await db
        .select()
        .from(schema.quizAttempts)
        .where(
          and(
            eq(schema.quizAttempts.id, attemptId),
            eq(schema.quizAttempts.userId, userId),
            eq(schema.quizAttempts.status, 'submitted'),
          ),
        )
        .limit(1);
      if (!attempt) throw new ApiHttpError(404, 'NOT_FOUND', 'Result not found');
      const quiz = await loadQuiz(attempt.quizId);
      if (!quiz) throw new ApiHttpError(404, 'NOT_FOUND', 'Quiz not found');
      const packed = parseJson<{ items?: AttemptResultItemDto[] }>(attempt.answersJson, {});
      return {
        id: attempt.id,
        quizId: attempt.quizId,
        userId: attempt.userId,
        startedAt: attempt.startedAt,
        expiresAt: attempt.expiresAt,
        submittedAt: attempt.submittedAt,
        score: attempt.score,
        status: attempt.status,
        passed: attempt.score !== null ? attempt.score >= quiz.passScore : null,
        items: packed.items ?? [],
      };
    },

    async getQuizCourseId(quizId) {
      const q = await loadQuiz(quizId);
      return q?.courseId ?? null;
    },

    async createAssignment(input) {
      const ts = nowSec();
      const id = newId();
      const title = sanitizeTitle(input.title);
      const description = input.description
        ? (sanitizeCourseContent(input.description) ?? input.description)
        : null;
      await db.insert(schema.assignments).values({
        id,
        courseId: input.courseId,
        lessonId: input.lessonId ?? null,
        title,
        description,
        dueAt: input.dueAt ?? null,
        status: 'draft',
        createdAt: ts,
        updatedAt: ts,
      });
      return {
        id,
        courseId: input.courseId,
        lessonId: input.lessonId ?? null,
        title,
        description,
        dueAt: input.dueAt ?? null,
        status: 'draft',
        createdAt: ts,
        updatedAt: ts,
      };
    },

    async publishAssignment(assignmentId) {
      const ts = nowSec();
      await db
        .update(schema.assignments)
        .set({ status: 'published', updatedAt: ts })
        .where(eq(schema.assignments.id, assignmentId));
      const [a] = await db
        .select()
        .from(schema.assignments)
        .where(eq(schema.assignments.id, assignmentId))
        .limit(1);
      if (!a) throw new ApiHttpError(404, 'NOT_FOUND', 'Assignment not found');
      return {
        id: a.id,
        courseId: a.courseId,
        lessonId: a.lessonId,
        title: a.title,
        description: a.description,
        dueAt: a.dueAt,
        status: a.status,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      };
    },

    async listAssignmentsForCourse(courseId, opts) {
      const rows = await db
        .select()
        .from(schema.assignments)
        .where(eq(schema.assignments.courseId, courseId));
      return rows
        .filter((a) => !opts?.publishedOnly || a.status === 'published')
        .map((a) => ({
          id: a.id,
          courseId: a.courseId,
          lessonId: a.lessonId,
          title: a.title,
          description: a.description,
          dueAt: a.dueAt,
          status: a.status,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        }));
    },

    async submitAssignment(input) {
      if (input.idempotencyKey) {
        const [existing] = await db
          .select()
          .from(schema.assignmentSubmissions)
          .where(
            and(
              eq(schema.assignmentSubmissions.assignmentId, input.assignmentId),
              eq(schema.assignmentSubmissions.userId, input.userId),
              eq(schema.assignmentSubmissions.idempotencyKey, input.idempotencyKey),
            ),
          )
          .limit(1);
        if (existing) {
          return {
            id: existing.id,
            assignmentId: existing.assignmentId,
            userId: existing.userId,
            content: existing.content,
            fileId: existing.fileId,
            status: existing.status,
            score: existing.score,
            feedback: existing.feedback,
            gradedBy: existing.gradedBy,
            gradedAt: existing.gradedAt,
            submittedAt: existing.submittedAt,
          };
        }
      }
      const [assignment] = await db
        .select()
        .from(schema.assignments)
        .where(eq(schema.assignments.id, input.assignmentId))
        .limit(1);
      if (!assignment || assignment.status !== 'published') {
        throw new ApiHttpError(404, 'NOT_FOUND', 'Assignment not found');
      }
      const ts = nowSec();
      const id = newId();
      const content = input.content
        ? (sanitizeCourseContent(input.content) ?? input.content)
        : null;
      await db.insert(schema.assignmentSubmissions).values({
        id,
        assignmentId: input.assignmentId,
        userId: input.userId,
        content,
        fileId: input.fileId ?? null,
        status: 'submitted',
        score: null,
        feedback: null,
        gradedBy: null,
        gradedAt: null,
        submittedAt: ts,
        idempotencyKey: input.idempotencyKey ?? null,
        createdAt: ts,
        updatedAt: ts,
      });
      return {
        id,
        assignmentId: input.assignmentId,
        userId: input.userId,
        content,
        fileId: input.fileId ?? null,
        status: 'submitted',
        score: null,
        feedback: null,
        gradedBy: null,
        gradedAt: null,
        submittedAt: ts,
      };
    },

    async gradeSubmission(input) {
      const ts = nowSec();
      await db
        .update(schema.assignmentSubmissions)
        .set({
          status: 'graded',
          score: input.score,
          feedback: input.feedback ?? null,
          gradedBy: input.gradedBy,
          gradedAt: ts,
          updatedAt: ts,
        })
        .where(eq(schema.assignmentSubmissions.id, input.submissionId));
      const [s] = await db
        .select()
        .from(schema.assignmentSubmissions)
        .where(eq(schema.assignmentSubmissions.id, input.submissionId))
        .limit(1);
      if (!s) throw new ApiHttpError(404, 'NOT_FOUND', 'Submission not found');
      return {
        id: s.id,
        assignmentId: s.assignmentId,
        userId: s.userId,
        content: s.content,
        fileId: s.fileId,
        status: s.status,
        score: s.score,
        feedback: s.feedback,
        gradedBy: s.gradedBy,
        gradedAt: s.gradedAt,
        submittedAt: s.submittedAt,
      };
    },

    async listSubmissions(assignmentId) {
      const rows = await db
        .select()
        .from(schema.assignmentSubmissions)
        .where(eq(schema.assignmentSubmissions.assignmentId, assignmentId));
      return rows.map((s) => ({
        id: s.id,
        assignmentId: s.assignmentId,
        userId: s.userId,
        content: s.content,
        fileId: s.fileId,
        status: s.status,
        score: s.score,
        feedback: s.feedback,
        gradedBy: s.gradedBy,
        gradedAt: s.gradedAt,
        submittedAt: s.submittedAt,
      }));
    },

    async getMySubmission(assignmentId, userId) {
      const rows = await db
        .select()
        .from(schema.assignmentSubmissions)
        .where(
          and(
            eq(schema.assignmentSubmissions.assignmentId, assignmentId),
            eq(schema.assignmentSubmissions.userId, userId),
          ),
        );
      const s = rows.sort((a, b) => b.submittedAt - a.submittedAt)[0];
      if (!s) return null;
      return {
        id: s.id,
        assignmentId: s.assignmentId,
        userId: s.userId,
        content: s.content,
        fileId: s.fileId,
        status: s.status,
        score: s.score,
        feedback: s.feedback,
        gradedBy: s.gradedBy,
        gradedAt: s.gradedAt,
        submittedAt: s.submittedAt,
      };
    },

    async getAssignmentCourseId(assignmentId) {
      const [a] = await db
        .select()
        .from(schema.assignments)
        .where(eq(schema.assignments.id, assignmentId))
        .limit(1);
      return a?.courseId ?? null;
    },
  };
}
