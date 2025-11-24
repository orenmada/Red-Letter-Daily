export interface Saying {
  id: number;
  text: string;
  text_es: string;
  reference: string;
  context?: string;
}

export interface ReflectionState {
  isLoading: boolean;
  content: string | null;
  error: string | null;
}