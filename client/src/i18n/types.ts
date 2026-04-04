import type en from './en';

export type Translations = { [K in keyof typeof en]: string };
export type TranslationKey = keyof typeof en;
export type Locale = 'en' | 'ru';
