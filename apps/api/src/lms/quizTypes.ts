/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/lms/quizTypes.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-20
 * ║ Updated: 2026-10-20
 * ║ Purpose: Quiz / assignment DTO types (M6)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type QuizStatus = 'draft' | 'published' | 'archived';
export type QuestionType = 'single_choice' | 'multiple_choice' | 'short_text';
export type AttemptStatus = 'in_progress' | 'submitted' | 'expired';
export type AssignmentStatus = 'draft' | 'published' | 'archived';
export type SubmissionStatus = 'submitted' | 'graded';

export type QuestionOption = { id: string; label: string };

export type QuizSummaryDto = {
  id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  timeLimitSec: number | null;
  maxAttempts: number;
  passScore: number;
  status: QuizStatus;
  questionCount: number;
  createdAt: number;
  updatedAt: number;
};

export type QuestionPublicDto = {
  id: string;
  type: QuestionType;
  text: string;
  options: QuestionOption[] | null;
  points: number;
  position: number;
};

export type QuestionStaffDto = QuestionPublicDto & {
  correctAnswer: unknown;
  explanation: string | null;
};

export type QuizTakeDto = {
  id: string;
  courseId: string;
  title: string;
  timeLimitSec: number | null;
  maxAttempts: number;
  passScore: number;
  status: QuizStatus;
  questions: QuestionPublicDto[];
};

export type QuizStaffDto = {
  id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  timeLimitSec: number | null;
  maxAttempts: number;
  passScore: number;
  status: QuizStatus;
  questions: QuestionStaffDto[];
};

export type AttemptDto = {
  id: string;
  quizId: string;
  userId: string;
  startedAt: number;
  expiresAt: number | null;
  submittedAt: number | null;
  score: number | null;
  status: AttemptStatus;
  passed: boolean | null;
};

export type AttemptResultItemDto = {
  questionId: string;
  correct: boolean;
  pointsEarned: number;
  pointsMax: number;
  explanation: string | null;
  correctAnswer: unknown;
  givenAnswer: unknown;
};

export type AttemptResultDto = AttemptDto & {
  items: AttemptResultItemDto[];
};

export type AssignmentDto = {
  id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  description: string | null;
  dueAt: number | null;
  status: AssignmentStatus;
  createdAt: number;
  updatedAt: number;
};

export type SubmissionDto = {
  id: string;
  assignmentId: string;
  userId: string;
  content: string | null;
  fileId: string | null;
  status: SubmissionStatus;
  score: number | null;
  feedback: string | null;
  gradedBy: string | null;
  gradedAt: number | null;
  submittedAt: number;
};
