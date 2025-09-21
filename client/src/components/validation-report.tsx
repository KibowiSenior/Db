import { AlertTriangle, XCircle, Info, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface ValidationReportProps {
  jobId: string;
}

export default function ValidationReport({ jobId }: ValidationReportProps) {
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
          <h3 className="text-lg font-semibold text-foreground mb-4">Validation Report</h3>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = data?.stats;
  const issues = data?.issues || [];

  const warningIssues = issues.filter((issue: any) => issue.issueType === 'warning');
  const errorIssues = issues.filter((issue: any) => issue.issueType === 'error');
  const infoIssues = issues.filter((issue: any) => issue.issueType === 'info');

  const recentChanges = issues
    .filter((issue: any) => issue.autoFixed)
    .slice(0, 5);

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Validation Report</h3>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-foreground" data-testid="total-issues">
              {stats?.totalIssues || 0}
            </div>
            <div className="text-xs text-muted-foreground">Issues Found</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-accent" data-testid="auto-fixed">
              {stats?.autoFixed || 0}
            </div>
            <div className="text-xs text-muted-foreground">Auto-Fixed</div>
          </div>
        </div>

        {/* Issue Categories */}
        <div className="space-y-3">
          {warningIssues.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="text-yellow-600 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Syntax Warnings</p>
                  <p className="text-xs text-yellow-600">Engine declarations</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {warningIssues.length}
              </Badge>
            </div>
          )}
          
          {errorIssues.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <XCircle className="text-red-600 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium text-red-800">Compatibility Issues</p>
                  <p className="text-xs text-red-600">Character set handling</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {errorIssues.length}
              </Badge>
            </div>
          )}
          
          {infoIssues.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Info className="text-blue-600 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Optimizations</p>
                  <p className="text-xs text-blue-600">Index improvements</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {infoIssues.length}
              </Badge>
            </div>
          )}
        </div>

        {/* Detailed Issues */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-foreground mb-3">Recent Changes</h4>
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {recentChanges.map((change: any, index: number) => (
                <div key={index} className="flex items-start space-x-2 text-xs">
                  <CheckCircle className="text-accent mt-0.5 h-3 w-3 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-foreground">
                      {change.lineNumber && `Line ${change.lineNumber}: `}
                      {change.description}
                    </p>
                    {change.originalText && (
                      <code className="bg-muted px-1 rounded text-xs">
                        {change.originalText.length > 50 
                          ? `${change.originalText.substring(0, 50)}...` 
                          : change.originalText
                        }
                      </code>
                    )}
                  </div>
                </div>
              ))}
              {recentChanges.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No changes recorded yet. Start analysis to see conversion details.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
