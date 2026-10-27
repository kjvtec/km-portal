export interface BRItem {
  code: string;
  title: string;
  page?: number;
}

export interface BusinessModule {
  code: string;
  name: string;
  en: string;
  desc: string;
  pages: string;
  startPage?: number;
  highlight?: string;
  iconName?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; similarity: number }>;
}

export interface PreviewPdfState {
  page: number;
  code: string;
  title: string;
}
