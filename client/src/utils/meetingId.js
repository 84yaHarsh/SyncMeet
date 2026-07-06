import { nanoid } from 'nanoid';

// Generates a short, URL-safe meeting ID (10 characters)
export const generateMeetingId = () => {
  return nanoid(10);
};
