import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { learningPaths } from '@/lib/paths';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-primary">
          Welcome to CyberGrad
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your personal AI-powered guide to mastering cybersecurity.
        </p>
        <p className="mt-2 text-md text-muted-foreground/80">
          Choose your learning path below to begin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {learningPaths.map((path) => (
          <Link href={`/learn/${path.slug}`} key={path.slug} className="group">
            <Card className="h-full bg-card/50 hover:bg-card/100 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-primary/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl font-headline text-primary/90 group-hover:text-primary transition-colors">
                    {path.title}
                  </CardTitle>
                  <ArrowRight className="text-muted-foreground group-hover:text-primary transition-all duration-300 transform group-hover:translate-x-1" />
                </div>
                <CardDescription className="pt-2">
                  {path.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
