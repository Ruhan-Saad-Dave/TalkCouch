const STORAGE_KEY = 'talkcouch_api_key';

export const getApiKey = (): string => localStorage.getItem(STORAGE_KEY) ?? '';
export const setApiKey = (key: string): void => localStorage.setItem(STORAGE_KEY, key.trim());
export const clearApiKey = (): void => localStorage.removeItem(STORAGE_KEY);
