
'use client';

import type { LearningPath } from '@/lib/paths';
import { getAdaptiveQuestion, getLearningModule } from './actions';
import { useProgress } from '@/hooks/use-progress';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect, useRef, useId } from 'react';
import type { AdaptiveQuestionGenerationOutput } from '@/ai/flows/adaptive-question-generation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Bot, User, BrainCircuit, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

type Message = {
  id: string;
  role: 'user' | 'bot' | 'system';
  content: React.ReactNode;
};

const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground my-4">
        <div className="flex-1 border-t border-dashed" />
        <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" />
            <span>{message.content}</span>
        </div>
        <div className="flex-1 border-t border-dashed" />
      </div>
    );
  }

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
          'max-w-[75%] rounded-lg p-3 text-sm shadow-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card/80 border border-border'
        )}
      >
        {message.content}
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
)


export function ChatWindow({ path }: { path: LearningPath }) {
  const { toast } = useToast();
  const { updateProgress, getPerformanceForAI } = useProgress(path.slug);
  const uniqueId = useId();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestionGenerationOutput | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [language, setLanguage] = useState('en-IN');
  const [phase, setPhase] = useState<'introduction' | 'learning' | 'quiz'>('introduction');
  const [moduleContent, setModuleContent] = useState('');
  const [explainedNext, setExplainedNext] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addMessage = (role: Message['role'], content: React.ReactNode) => {
    setMessages((prev) => [...prev, { id: `${uniqueId}-${prev.length}`, role, content }]);
  };
  
  useEffect(() => {
    const startLearning = async () => {
        setIsLoading(true);
        addMessage('system', 'AI Tutor Initializing');
        addMessage('bot', `Hello! Welcome to the "${path.title}" module. Let's begin.`);
        
        const moduleResult = await getLearningModule({
            topic: path.title,
            studentLevel: path.level,
            learningSpeed: 'Normal', // This could be a user setting in the future
        });

        if (moduleResult.success) {
            setModuleContent(moduleResult.data.content);
            setPhase('learning');
            addMessage('bot', moduleResult.data.content);
        } else {
            addMessage('bot', "I'm sorry, I couldn't prepare the learning material. Please try again later.");
            toast({ variant: 'destructive', title: 'Error', description: moduleResult.error });
            setIsLoading(false);
        }
    };
    startLearning();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path.slug]);

  useEffect(() => {
    if (phase === 'learning' && moduleContent && !explainedNext) {
      const timer = setTimeout(() => {
        addMessage('bot', 'After you have finished studying the content, type "next" to proceed to the quiz.');
        setExplainedNext(true);
        setIsLoading(false);
        inputRef.current?.focus();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, moduleContent, explainedNext]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const startQuiz = () => {
    setPhase('quiz');
    addMessage('system', 'Starting Quiz');
    addMessage('bot', 'Great! Let\'s test your knowledge.');
    fetchNextQuestion(difficulty, 0.5);
  };

  const fetchNextQuestion = async (
    newDifficulty: 'easy' | 'medium' | 'hard',
    performance: number
  ) => {
    setIsLoading(true);
    const questionResult = await getAdaptiveQuestion({
      topic: path.title,
      difficulty: newDifficulty,
      userPerformance: performance,
    });

    if (questionResult.success) {
      setCurrentQuestion(questionResult.data);
      addMessage('bot', questionResult.data.question);
      setDifficulty(questionResult.data.newDifficulty);
    } else {
      addMessage('bot', "I'm having trouble coming up with the next question. Please give me a moment and try again.");
      toast({ variant: 'destructive', title: 'Error', description: questionResult.error });
    }
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    addMessage('user', userInput);
    const lowerCaseInput = userInput.trim().toLowerCase();
    setUserInput('');
    
    if (phase === 'learning') {
      if(lowerCaseInput === 'next') {
        startQuiz();
      } else {
        addMessage('bot', 'Please type "next" to start the quiz.');
      }
      return;
    }

    if (phase === 'quiz' && currentQuestion) {
      setIsLoading(true);
      
      // Simple answer check
      const isCorrect = currentQuestion.answer.trim().toLowerCase() === lowerCaseInput;
      
      updateProgress(isCorrect ? 1 : 0);
      
      if(isCorrect) {
          addMessage('bot', `Correct! Great job. Here's a bit more on that: ${currentQuestion.explanation}`);
      } else {
          addMessage('bot', `Not quite. The correct answer is "${currentQuestion.answer}". Here's why: ${currentQuestion.explanation}`);
      }

      const performance = getPerformanceForAI();
      await new Promise(resolve => setTimeout(resolve, 1000)); // wait a bit before next question
      
      fetchNextQuestion(difficulty, performance);
    }
  };

  const getPlaceholderText = () => {
    if (isLoading) return "Wait for the bot's response...";
    if (phase === 'learning') return 'Type "next" to continue...';
    if (phase === 'quiz') return 'Type your answer...';
    return 'Loading...'
  }

  return (
    <div className="flex flex-col h-full bg-background">
        <header className="p-4 border-b flex items-center gap-3">
            <Link href="/" passHref>
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            </Link>
            <ShieldCheck className="w-8 h-8 text-primary"/>
            <div>
                <h1 className="text-lg font-bold font-headline text-primary">{path.title}</h1>
                <p className="text-sm text-muted-foreground">{path.level}</p>
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
            placeholder={getPlaceholderText()}
            disabled={isLoading || phase === 'introduction'}
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isLoading || !userInput.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
