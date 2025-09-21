import { Eye, Expand } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface CodeComparisonProps {
  jobId: string;
}

export default function CodeComparison({ jobId }: CodeComparisonProps) {
  const { data, isLoading } = useQuery<{
    job: any;
    issues: any[];
    stats: any;
  }>({
    queryKey: ['/api/convert', jobId],
    enabled: !!jobId,
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Code Comparison</h3>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  const originalSQL = data?.job?.originalContent || '';
  const convertedSQL = data?.job?.convertedContent || '';

  // Get first few lines for preview
  const getPreviewLines = (sql: string, lines: number = 20) => {
    return sql.split('\n').slice(0, lines).join('\n');
  };

  const originalPreview = getPreviewLines(originalSQL);
  const convertedPreview = getPreviewLines(convertedSQL);

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Code Comparison</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              data-testid="hide-unchanged-button"
            >
              <Eye className="h-3 w-3 mr-1" />
              Hide unchanged
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              data-testid="fullscreen-button"
            >
              <Expand className="h-3 w-3 mr-1" />
              Full screen
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 h-96">
          {/* Original SQL */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Original SQL</span>
              <span className="text-xs text-muted-foreground">MySQL Format</span>
            </div>
            <div className="flex-1 bg-muted rounded-lg p-4">
              <ScrollArea className="h-full">
                <pre className="text-xs text-foreground leading-relaxed font-mono whitespace-pre-wrap">
                  {originalPreview || 'No original content available'}
                </pre>
              </ScrollArea>
            </div>
          </div>
          
          {/* Converted SQL */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Converted SQL</span>
              <span className="text-xs text-accent">
                {convertedSQL ? 'MariaDB 10.3 Compatible' : 'Conversion Pending'}
              </span>
            </div>
            <div className="flex-1 bg-muted rounded-lg p-4">
              <ScrollArea className="h-full">
                <pre className="text-xs text-foreground leading-relaxed font-mono whitespace-pre-wrap">
                  {convertedPreview || 'Run analysis to see converted content'}
                </pre>
              </ScrollArea>
            </div>
          </div>
        </div>
        
        {/* Diff Legend */}
        <div className="flex items-center space-x-4 mt-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-200 rounded"></div>
            <span className="text-muted-foreground">Removed</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <span className="text-muted-foreground">Added</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-200 rounded"></div>
            <span className="text-muted-foreground">Modified</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
