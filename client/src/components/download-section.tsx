import { Eye, Download, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface DownloadSectionProps {
  jobId: string;
}

export default function DownloadSection({ jobId }: DownloadSectionProps) {
  const { toast } = useToast();
  
  const { data } = useQuery<{
    job: any;
    issues: any[];
    stats: any;
  }>({
    queryKey: ['/api/convert', jobId],
    enabled: !!jobId,
  });

  const job = data?.job;
  const stats = data?.stats;

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/convert/${jobId}/download`);
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      const fileName = job?.fileName?.replace(/\.[^/.]+$/, "") + "_mariadb103.sql" || "converted.sql";
      a.download = fileName;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: "Your converted SQL file is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the converted file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const convertedSize = job?.convertedContent ? 
    new Blob([job.convertedContent]).size : 
    job?.fileSize || 0;

  const conversionTime = stats?.conversionTimeMs ? 
    (stats.conversionTimeMs / 1000).toFixed(1) + 's' : 
    'N/A';

  const isCompleted = job?.status === 'completed';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Download Converted File</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isCompleted 
                ? "Your SQL file has been successfully converted for MariaDB 10.3"
                : "Conversion in progress or pending"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              disabled={!isCompleted}
              data-testid="preview-button"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleDownload}
              disabled={!isCompleted}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              data-testid="download-button"
            >
              <Download className="h-4 w-4 mr-2" />
              Download SQL
            </Button>
          </div>
        </div>
        
        {/* File Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-lg font-semibold text-foreground" data-testid="original-size">
              {job?.fileSize ? formatFileSize(job.fileSize) : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Original Size</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-lg font-semibold text-foreground" data-testid="converted-size">
              {formatFileSize(convertedSize)}
            </div>
            <div className="text-xs text-muted-foreground">Converted Size</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-lg font-semibold text-accent" data-testid="changes-count">
              {stats?.autoFixed || 0}
            </div>
            <div className="text-xs text-muted-foreground">Changes Made</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-lg font-semibold text-foreground" data-testid="conversion-time">
              {conversionTime}
            </div>
            <div className="text-xs text-muted-foreground">Conversion Time</div>
          </div>
        </div>
        
        {/* Conversion Summary */}
        {isCompleted && (
          <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="text-accent mt-0.5 h-5 w-5" />
              <div>
                <h4 className="font-medium text-foreground">Conversion Complete</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Successfully converted your MySQL dump to MariaDB 10.3 format. All compatibility issues have been resolved and the file is ready for import.
                </p>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Key changes:</strong> Updated character set declarations, modified engine specifications, 
                    optimized index definitions, and ensured MariaDB 10.3 syntax compatibility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
