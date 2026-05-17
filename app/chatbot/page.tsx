'use client';
import 'regenerator-runtime/runtime';
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, Mic, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getChatbotResponse } from './actions';
import useClipboard from 'react-use-clipboard';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


type Message = {
  id: string;
  role: 'user' | 'bot';
  content: React.ReactNode;
};

const CopyButton = ({ text }: { text: string }) => {
  const [isCopied, setCopied] = useClipboard(text, {
    successDuration: 1000,
  });

  return (
    <Button variant="ghost" size="icon" onClick={setCopied} className="h-6 w-6">
      {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </Button>
  );
};


const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === 'user';
  const contentAsString = typeof message.content === 'string' ? message.content : '';


  return (
    <div className={cn('flex items-start gap-3 my-4', isUser && 'justify-end')}>
      {!isUser && (
        <Avatar className="w-8 h-8 border-2 border-primary/50">
          <AvatarFallback className="bg-background text-primary">
            <Bot className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[75%] rounded-lg p-3 text-sm shadow-sm relative group',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card/80 border border-border'
        )}
      >
        {message.content}
        {!isUser && (
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton text={contentAsString} />
          </div>
        )}
      </div>
      {isUser && (
        <Avatar className="w-8 h-8 border-2 border-accent/50">
          <AvatarFallback className="bg-background text-accent">
            <User className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

const BotLoadingMessage = () => (
  <div className={cn('flex items-start gap-3 my-4')}>
    <Avatar className="w-8 h-8 border-2 border-primary/50">
      <AvatarFallback className="bg-background text-primary">
        <Bot className="w-5 h-5" />
      </AvatarFallback>
    </Avatar>
    <div className="max-w-[75%] rounded-lg p-3 text-sm bg-card/80 border border-border">
      <div className="flex items-center gap-2">
        <Skeleton className="w-3 h-3 rounded-full animate-bounce" />
        <Skeleton className="w-3 h-3 rounded-full animate-bounce delay-150" />
        <Skeleton className="w-3 h-3 rounded-full animate-bounce delay-300" />
      </div>
    </div>
  </div>
);

export default function ChatbotPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [language, setLanguage] = useState('en-IN');
  const [isClient, setIsClient] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (transcript) {
      setUserInput(transcript);
    }
  }, [transcript]);


  const addMessage = (role: Message['role'], content: React.ReactNode) => {
    setMessages((prev) => [...prev, { id: `msg-${prev.length}`, role, content }]);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  useEffect(() => {
    // Check if there are no messages before adding the initial one
    if (messages.length === 0) {
      addMessage('bot', 'Hello! How can I help you today?');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const query = userInput;
    addMessage('user', query);
    setUserInput('');
    resetTranscript();
    setIsLoading(true);

    const result = await getChatbotResponse({ prompt: query, language });
    setIsLoading(false);

    if (result.success) {
      addMessage('bot', result.data.response);
    } else {
      addMessage('bot', "I'm sorry, I couldn't process your request. Please try again.");
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    inputRef.current?.focus();
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      if(userInput.trim()){
        handleSendMessage();
      }
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language });
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="p-4 border-b flex items-center gap-3">
        <Bot className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-lg font-bold font-headline text-primary">AI Chatbot</h1>
          <p className="text-sm text-muted-foreground">Ask me anything!</p>
        </div>
      </header>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && <BotLoadingMessage />}
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-3xl mx-auto">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-IN">English</SelectItem>
              <SelectItem value="hi-IN">Hindi</SelectItem>
            </SelectContent>
          </Select>
          <Input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={listening ? "Listening..." : "Type in English or Hindi..."}
            disabled={isLoading}
            className="flex-1"
            autoComplete="off"
          />
           {isClient && browserSupportsSpeechRecognition && (
            <Button type="button" size="icon" onClick={toggleListening} variant={listening ? 'destructive' : 'outline'}>
              <Mic className="w-4 h-4" />
            </Button>
          )}
          <Button type="submit" size="icon" disabled={isLoading || !userInput.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
