
import { learningPaths } from '@/lib/paths';
import { notFound } from 'next/navigation';
import { ChatWindow } from './chat-window';

type LearnPageProps = {
  params: {
    slug: string;
  };
};

export default function LearnPage({ params }: LearnPageProps) {
  const { slug } = params;
  const path = learningPaths.find((p) => p.slug === slug);

  if (!path) {
    notFound();
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <ChatWindow path={path} />
    </div>
  );
}
