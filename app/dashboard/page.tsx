
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useProgress } from '@/hooks/use-progress';
import { learningPaths } from '@/lib/paths';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-primary">
          Your Progress
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Track your journey to becoming a cybersecurity expert.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {learningPaths.map((path) => (
          <ProgressCard key={path.slug} pathSlug={path.slug} />
        ))}
      </div>
    </div>
  );
}

function ProgressCard({ pathSlug }: { pathSlug: string }) {
  const { getProgress } = useProgress(pathSlug);
  const { completion, averageScore } = getProgress();
  const path = learningPaths.find((p) => p.slug === pathSlug);

  if (!path) return null;

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{path.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-muted-foreground">
                Completion
              </span>
              <span className="text-sm font-medium text-primary">
                {completion.toFixed(0)}%
              </span>
            </div>
            <Progress value={completion} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-muted-foreground">
                Average Score
              </span>
              <span className="text-sm font-medium text-accent">
                {averageScore === -1 ? 'N/A' : `${(averageScore * 100).toFixed(0)}%`}
              </span>
            </div>
            <Progress value={averageScore === -1 ? 0 : averageScore * 100} indicatorClassName="bg-accent" className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
