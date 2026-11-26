import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email('Adresa de email este invalidă'),
  password: z
    .string()
    .min(8, 'Parola trebuie să conțină cel puțin 8 caractere'),
  username: z
    .string()
    .trim()
    .min(2, 'Numele afișat trebuie să aibă cel puțin 2 caractere')
    .max(50, 'Numele afișat poate avea maximum 50 de caractere'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Adresa de email este invalidă'),
  password: z.string().min(1, 'Parola este obligatorie'),
});

export const gameStatusEnum = z.enum(['WANT_TO_PLAY', 'PLAYING', 'COMPLETED']);

export const addLibraryItemSchema = z.object({
  rawgId: z.coerce
    .number()
    .int('rawgId trebuie să fie un număr întreg')
    .positive('rawgId trebuie să fie pozitiv'),
  status: gameStatusEnum.default('WANT_TO_PLAY'),
});

export const updateLibraryItemSchema = z
  .object({
    status: gameStatusEnum.optional(),
    rating: z
      .number()
      .int('Nota trebuie să fie un număr întreg')
      .min(1, 'Nota trebuie să fie între 1 și 10')
      .max(10, 'Nota trebuie să fie între 1 și 10')
      .nullable()
      .optional(),
    review: z
      .string()
      .max(1000, 'Recenzia poate avea maximum 1000 de caractere')
      .nullable()
      .optional(),
  })
  .refine(
    (data) =>
      data.status !== undefined ||
      data.rating !== undefined ||
      data.review !== undefined,
    { message: 'Cel puțin un câmp trebuie furnizat pentru actualizare' }
  );

export const libraryQuerySchema = z.object({
  status: gameStatusEnum.optional(),
  platform: z.string().trim().min(1).optional(),
  sort: z.enum(['title', 'rating', 'added_at']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const idParamSchema = z.object({
  id: z.string().trim().min(1, 'ID invalid'),
});

export const rawgIdParamSchema = z.object({
  rawgId: z.coerce
    .number()
    .int('rawgId invalid')
    .positive('rawgId trebuie să fie pozitiv'),
});

export const gamesSearchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Parametrul de căutare q este obligatoriu'),
});

export const updateProfileSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(2, 'Numele afișat trebuie să aibă cel puțin 2 caractere')
      .max(50, 'Numele afișat poate avea maximum 50 de caractere')
      .optional(),
    avatarUrl: z
      .string()
      .url('URL-ul avatarului este invalid')
      .nullable()
      .optional(),
  })
  .refine(
    (data) => data.username !== undefined || data.avatarUrl !== undefined,
    { message: 'Cel puțin un câmp trebuie furnizat pentru actualizare' }
  );
