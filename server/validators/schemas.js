const { z } = require('zod');

// Meeting IDs are generated client-side with nanoid(10): URL-safe alphabet.
const meetingIdSchema = z
  .string()
  .trim()
  .min(4, 'Meeting ID is too short')
  .max(64, 'Meeting ID is too long')
  .regex(/^[A-Za-z0-9_-]+$/, 'Meeting ID contains invalid characters');

const googleLoginBodySchema = z.object({
  token: z.string().min(20, 'Token is required'),
});

const meetingParamsSchema = z.object({
  id: meetingIdSchema,
});

// --- Socket.IO payload schemas ---

const joinRoomSchema = z.object({
  roomId: meetingIdSchema,
});

const leaveRoomSchema = z.object({
  roomId: meetingIdSchema,
});

const signalSchema = z.object({
  to: z.string().min(1).max(64),
  signal: z.any().refine((v) => v !== undefined && v !== null, 'signal is required'),
});

const mediaStateChangeSchema = z.object({
  roomId: meetingIdSchema,
  state: z.object({
    isAudioMuted: z.boolean().optional(),
    isVideoOff: z.boolean().optional(),
    isScreenSharing: z.boolean().optional(),
  }),
});

const chatMessageSchema = z.object({
  roomId: meetingIdSchema,
  text: z.string().trim().min(1, 'Message cannot be empty').max(1000, 'Message is too long'),
});

module.exports = {
  meetingIdSchema,
  googleLoginBodySchema,
  meetingParamsSchema,
  joinRoomSchema,
  leaveRoomSchema,
  signalSchema,
  mediaStateChangeSchema,
  chatMessageSchema,
};
