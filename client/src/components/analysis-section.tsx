import { useState, useEffect } from "react";
import { Play, Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AnalysisSectionProps {
  jobId: string;
}

interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed';
}

export default function AnalysisSection({ jobId }: AnalysisSectionProps) {
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { id: 'parsing', label: 'Parsing SQL statements', status: 'pending' },
    { id: 'compatibility', label: 'Checking MariaDB 10.3 compatibility', status: 'pending' },
    { id: 'recommendations', label: 'Generating conversion recommendations', status: 'pending' },
    { id: 'output', label: 'Creating optimized SQL output', status: 'pending' },
  ]);
  const { toast } = useToast();

  const { data: jobData } = useQuery<{
    job: any;
    issues: any[];
    stats: any;
  }>({
    queryKey: ['/api/convert', jobId],
    enabled: !!jobId,
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/convert/${jobId}/analyze`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the job data to show updated results
      queryClient.invalidateQueries({
        queryKey: ['/api/convert', jobId]
      });
      
      toast({
        title: "Analysis completed",
        description: "Your SQL file has been successfully analyzed and converted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze the SQL file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startAnalysis = () => {
    analyzeMutation.mutate();
  };

  // Simulate progress updates during analysis
  useEffect(() => {
    if (analyzeMutation.isPending) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = Math.min(prev + 10, 90);
          
          // Update step statuses based on progress
          setSteps((prevSteps) => {
            return prevSteps.map((step, index) => {
              if (newProgress >= (index + 1) * 20) {
                return { ...step, status: 'completed' as const };
              } else if (newProgress >= index * 20) {
                return { ...step, status: 'running' as const };
              }
              return step;
            });
          });

          return newProgress;
        });
      }, 200);

      return () => clearInterval(interval);
    } else if (analyzeMutation.isSuccess) {
      setProgress(100);
      setSteps((prevSteps) => 
        prevSteps.map((step) => ({ ...step, status: 'completed' as const }))
      );
    }
  }, [analyzeMutation.isPending, analyzeMutation.isSuccess]);

  const isCompleted = jobData?.job?.status === 'completed';
  const canStartAnalysis = jobData?.job?.status === 'pending' && !analyzeMutation.isPending;

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">MariaDB 10.3 Compatibility Analysis</h2>
          <Button
            onClick={startAnalysis}
            disabled={!canStartAnalysis}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="start-analysis-button"
          >
            {analyzeMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {analyzeMutation.isPending ? 'Analyzing...' : isCompleted ? 'Analysis Complete' : 'Start Analysis'}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span data-testid="progress-label">
              {analyzeMutation.isPending ? 'Analyzing SQL syntax...' : 
               isCompleted ? 'Analysis completed' : 'Ready to analyze'}
            </span>
            <span data-testid="progress-percentage">{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" data-testid="progress-bar" />
        </div>

        {/* Analysis Steps */}
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                step.status === 'running' ? 'bg-muted/50' : 'bg-transparent'
              }`}
              data-testid={`analysis-step-${step.id}`}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center">
                {step.status === 'completed' && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="text-xs text-primary-foreground" />
                  </div>
                )}
                {step.status === 'running' && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Loader2 className="text-xs text-primary-foreground animate-spin" />
                  </div>
                )}
                {step.status === 'pending' && (
                  <div className="w-6 h-6 rounded-full border-2 border-muted"></div>
                )}
              </div>
              <span className={`text-sm ${
                step.status === 'running' ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
