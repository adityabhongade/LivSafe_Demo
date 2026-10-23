import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { Send, Bot, User, Loader2, Copy, Download, FileText, BookOpen, ExternalLink, Sparkles, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { assistantAPI } from '@/lib/api';

const STANDARD_PROMPTS = [
  'Share your observations',
  'What are the findings?',
  'Summarize guideline recommendations',
] as const;

function stripThoughtTokens(text: string): string {
  if (!text) return '';
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .replace(/\[thought\][\s\S]*?\[\/thought\]/gi, '')
    .replace(/<think>[\s\S]*$/gi, '')
    .replace(/<thought>[\s\S]*$/gi, '')
    .replace(/^Thought:\s*[\s\S]*?\n\n/i, '')
    .replace(/^Thinking Process:\s*[\s\S]*?\n\n/i, '')
    .trim();
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|\[\d+(?:,\s*\d+)*\])/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Inline code: `text`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={index} className="rounded bg-primary-800 px-1.5 py-0.5 font-mono text-xs text-accent">
          {part.slice(1, -1)}
        </code>
      );
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} className="italic text-primary-200">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Citation badge: [1], [2], [1, 2]
    if (/^\[\d+(?:,\s*\d+)*\]$/.test(part)) {
      return (
        <span
          key={index}
          className="inline-flex items-center justify-center font-bold text-accent text-[11px] mx-0.5 px-1.5 py-0.2 rounded bg-accent/20 border border-accent/40 align-baseline cursor-default select-none"
        >
          {part}
        </span>
      );
    }

    return part;
  });
}

function FormattedMessage({ content }: { content: string }) {
  const cleanText = stripThoughtTokens(content);
  if (!cleanText) return null;

  const lines = cleanText.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (currentList.length > 0 && listType) {
      if (listType === 'ul') {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-2 space-y-1 list-disc pl-5 text-primary-100">
            {currentList}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-2 space-y-1 list-decimal pl-5 text-primary-100">
            {currentList}
          </ol>
        );
      }
      currentList = [];
      listType = null;
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    // Headings
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={idx} className="text-sm md:text-base font-bold text-white mt-3 mb-1.5">
          {parseInlineMarkdown(line.slice(4))}
        </h4>
      );
      return;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={idx} className="text-base md:text-lg font-bold text-white mt-3.5 mb-2 border-b border-primary-600/40 pb-1">
          {parseInlineMarkdown(line.slice(3))}
        </h3>
      );
      return;
    }
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={idx} className="text-lg md:text-xl font-bold text-white mt-4 mb-2">
          {parseInlineMarkdown(line.slice(2))}
        </h2>
      );
      return;
    }

    // Unordered list item (- or * or •)
    if (/^[-*•]\s+/.test(line)) {
      if (listType && listType !== 'ul') flushList();
      listType = 'ul';
      currentList.push(
        <li key={`li-${idx}`} className="leading-relaxed">
          {parseInlineMarkdown(line.replace(/^[-*•]\s+/, ''))}
        </li>
      );
      return;
    }

    // Ordered list item (1. 2. etc.)
    if (/^\d+\.\s+/.test(line)) {
      if (listType && listType !== 'ol') flushList();
      listType = 'ol';
      currentList.push(
        <li key={`li-${idx}`} className="leading-relaxed">
          {parseInlineMarkdown(line.replace(/^\d+\.\s+/, ''))}
        </li>
      );
      return;
    }

    // Standard paragraph
    flushList();
    elements.push(
      <p key={idx} className="mb-2 leading-relaxed text-primary-100 last:mb-0">
        {parseInlineMarkdown(line)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1">{elements}</div>;
}

export interface CitationItem {
  index: number;
  chunk_id: string;
  title: string;
  source: string;
  year?: string | null;
  url?: string | null;
}

export interface RetrievedChunkInfo {
  chunk_id: string;
  title: string;
  source: string;
  year?: string | null;
  url?: string | null;
  section?: string | null;
  score?: number;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isAnalysis?: boolean;
  citations?: CitationItem[];
  retrievedChunks?: RetrievedChunkInfo[];
}

interface ChatWindowProps {
  medicalImageId?: string;
}

export function ChatWindow({ medicalImageId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome-' + Date.now(),
      type: 'ai',
      content: medicalImageId
        ? 'This conversation is linked to a saved ultrasound image. Ask about visible ultrasound features or liver fibrosis staging guidelines. All answers are grounded in our curated knowledge base with citations.'
        : 'Ask a question about liver fibrosis assessment, METAVIR/FIB-4 staging, or ultrasound elastography. All answers are grounded in our liver fibrosis knowledge base with inline citations [1], [2].',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [medicalImageId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAssistantResponse = async (userMessage: string): Promise<{
    text: string;
    citations?: CitationItem[];
    retrievedChunks?: RetrievedChunkInfo[];
  }> => {
    try {
      const conversationHistory = messages;

      const response = await assistantAPI.chat({
        message: userMessage,
        messages: conversationHistory.map((msg) => ({
          type: msg.type,
          content: msg.content,
          isAnalysis: msg.isAnalysis,
        })),
        medicalImageId,
      });

      const text = response?.data?.response || response?.response || 'I apologize, but I encountered an issue generating a response. Please try again.';
      const citations = response?.data?.citations || response?.citations || [];
      const retrievedChunks = response?.data?.retrievedChunks || response?.retrievedChunks || [];

      return { text, citations, retrievedChunks };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate response');
    }
  };

  const sendMessage = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: 'user-' + Date.now(),
      type: 'user',
      content: trimmed,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await generateAssistantResponse(trimmed);
      
      const aiMessage: Message = {
        id: 'ai-' + Date.now(),
        type: 'ai',
        content: result.text,
        citations: result.citations,
        retrievedChunks: result.retrievedChunks,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      // Parse the error message
      let errorTitle = 'AI Service Error';
      let errorDescription = error.message || 'An unexpected error occurred';
      
      // Handle specific error types
      if (error.message.includes('401') || error.message.includes('403') || error.message.includes('NVIDIA_AUTH_FAILED')) {
        errorDescription = 'AI API authentication failed. Please contact your administrator to update the API key.';
        errorTitle = 'AI Configuration Error';
      } else if (error.message.includes('503') || error.message.includes('unavailable')) {
        errorDescription = 'The AI service is temporarily unavailable. Please try again in a moment.';
        errorTitle = 'Service Unavailable';
      } else if (error.message.includes('Cannot connect') || error.message.includes('localhost')) {
        errorDescription = 'Cannot connect to the server. Please ensure the backend is running.';
        errorTitle = 'Connection Error';
      }
      
      const errorMessage: Message = {
        id: 'error-' + Date.now(),
        type: 'ai',
        content: `⚠️ ${errorDescription}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        variant: 'destructive',
        title: errorTitle,
        description: errorDescription,
        className:'text-white'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied to clipboard',
      description: 'Message copied successfully',
      className:'text-white'
    });
  };

  const downloadConversation = async () => {
    try {
      // Dynamic import for jsPDF
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Medical Consultation with LivSafe', 20, 30);
      
      // Add patient information if available
      // Add conversation
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CONVERSATION:', 20, 50);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let yPos = 65;
      
      messages.forEach((message, index) => {
        const timestamp = message.timestamp.toLocaleString();
        const sender = message.type === 'user' ? 'You' : 'LivSafe LLM';
        const content = message.content;
        
        // Add message header
        doc.setFont('helvetica', 'bold');
        doc.text(`[${timestamp}] ${sender}:`, 20, yPos);
        yPos += 5;
        
        // Add message content
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(content, 170);
        doc.text(splitText, 20, yPos);
        yPos += splitText.length * 5 + 10;
        
        // Add new page if needed
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
      });
      
      // Add footer
      doc.setFontSize(8);
      doc.text(`Report Generated: ${new Date().toLocaleString()}`, 20, 270);
      doc.text('System: LivSafe Medical Assistant', 20, 280);
      
      // Save the PDF
      doc.save(`consultation-${medicalImageId ? 'image-review' : 'general'}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: 'Conversation Downloaded',
        description: 'Your consultation has been saved as PDF',
        className:'text-white'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not generate PDF. Please try again.',
        className:'text-white'
      });
    }
  };

  return (
    <div className="chat-workspace flex flex-col h-screen bg-primary-900">
      {/* Header */}
      <div className="chat-workspace__header bg-primary-800 border-b border-primary-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/doctor/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-300 hover:text-white hover:bg-primary-700 p-2 h-9 rounded-lg mr-1 flex items-center gap-1.5"
              title="Return to Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden md:inline text-xs font-medium">Dashboard</span>
            </Button>
          </Link>
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">LivSafe</h1>
            <p className="text-sm text-primary-400">Grounded Clinical Decision Support</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {medicalImageId && <span className="mr-4 text-xs text-primary-300">Ultrasound image attached</span>}
          <Link href="/doctor/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="border-primary-600 text-primary-200 hover:text-white hover:bg-primary-700 flex items-center gap-1.5"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadConversation}
            className="border-primary-600 text-primary-300 hover:text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div className="flex items-center mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                  message.type === 'user' ? 'bg-primary-600' : 'bg-accent'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <span className="text-xs text-primary-400">
                  {message.type === 'user' ? 'You' : 'LivSafe LLM'} • {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className={`p-4 rounded-lg ${
                message.type === 'user' 
                  ? 'chat-workspace__user bg-primary-600 text-white'
                  : message.isAnalysis 
                    ? 'bg-accent/20 border border-accent/30 text-white'
                    : 'chat-workspace__assistant bg-primary-700 text-white'
              }`}>
                {message.isAnalysis && (
                  <div className="flex items-center mb-2 text-accent">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Liver Fibrosis Analysis</span>
                  </div>
                )}
                <FormattedMessage content={message.content} />

                {message.type === 'ai' && message.citations && message.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-primary-600/50">
                    <div className="flex items-center text-xs font-semibold text-accent mb-2">
                      <BookOpen className="h-3.5 w-3.5 mr-1" />
                      Grounded Clinical Sources & Guidelines:
                    </div>
                    <div className="space-y-1.5">
                      {message.citations.map((cite) => (
                        <div
                          key={cite.chunk_id || cite.index}
                          className="text-xs bg-primary-800/80 p-2 rounded border border-primary-600/40 flex items-start justify-between"
                        >
                          <div className="pr-2">
                            <span className="font-bold text-accent mr-1.5">[{cite.index}]</span>
                            <span className="text-white font-medium">{cite.title}</span>
                            {cite.year && <span className="text-primary-400 ml-1">({cite.year})</span>}
                            <span className="text-primary-300 ml-1.5 text-[10px] bg-primary-700 px-1.5 py-0.5 rounded">
                              {cite.source}
                            </span>
                          </div>
                          {cite.url && (
                            <a
                              href={cite.url.startsWith('http') ? cite.url : `https://doi.org/${cite.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:text-accent/80 ml-2 inline-flex items-center flex-shrink-0"
                              title="Open reference source"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {message.type === 'ai' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-6 px-2 text-xs text-primary-300 hover:text-white"
                    onClick={() => copyMessage(message.content)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Ready-made standard prompts when starting (3 only) */}
        {messages.filter((m) => m.type === 'user').length === 0 && (
          <div className="rounded-xl border border-primary-700 bg-primary-800/80 p-4 max-w-[85%] mx-auto my-4 shadow-md">
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-primary-300">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>Standard Prompts to Start</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {STANDARD_PROMPTS.map((promptText) => (
                <button
                  key={promptText}
                  type="button"
                  onClick={() => sendMessage(promptText)}
                  disabled={isLoading}
                  className="flex flex-col items-start justify-between rounded-lg border border-primary-600 bg-primary-700/70 p-3 text-left transition hover:bg-primary-600 hover:border-accent text-white group disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <span className="text-sm font-medium group-hover:text-accent-foreground transition flex items-center justify-between w-full">
                    {promptText}
                    <Send className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition text-accent ml-2 shrink-0" />
                  </span>
                  <span className="text-[11px] text-primary-300 mt-2">
                    Click to put into chat &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-accent">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-primary-400">LivSafe is typing...</span>
              </div>
              <div className="p-4 rounded-lg bg-primary-700 text-white">
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing your question...
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-primary-800 border-t border-primary-700 p-4">
        {messages.filter((m) => m.type === 'user').length === 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="text-xs text-primary-400 flex items-center gap-1 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Standard prompts:
            </span>
            {STANDARD_PROMPTS.map((promptText) => (
              <button
                key={promptText}
                type="button"
                onClick={() => sendMessage(promptText)}
                disabled={isLoading}
                className="text-xs rounded-full border border-primary-600 bg-primary-700 hover:bg-accent hover:border-accent hover:text-white px-3 py-1 text-primary-200 transition disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                <span>{promptText}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask LivSafe about liver health, fibrosis, treatment options..."
              className="bg-primary-700 border-primary-600 text-white placeholder-gray-400  resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-accent hover:bg-accent/90 px-4 py-2 h-auto"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-primary-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
