import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, FileCode, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  onJobCreated: (jobId: string) => void;
}

interface UploadedFile {
  name: string;
  size: number;
  lastModified: number;
}

export default function FileUpload({ onJobCreated }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiRequest('POST', '/api/convert', formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "File uploaded successfully",
        description: "Your SQL file has been uploaded and is ready for conversion.",
      });
      onJobCreated(data.jobId);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload the SQL file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (!file.name.endsWith('.sql')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a .sql file.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 50MB.",
          variant: "destructive",
        });
        return;
      }

      setUploadedFile({
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
      });

      uploadMutation.mutate(file);
    }
  }, [toast, uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/sql': ['.sql'],
      'text/plain': ['.sql'],
    },
    multiple: false,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatLastModified = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Modified less than an hour ago';
    if (diffInHours < 24) return `Modified ${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Modified ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Upload SQL File</h2>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer ${
            isDragActive ? 'border-primary bg-primary/5' : ''
          }`}
          data-testid="upload-area"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <CloudUpload className="text-2xl text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground mb-1">
                {isDragActive ? 'Drop your SQL file here' : 'Drop your SQL file here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or <span className="text-primary font-medium">browse</span> to upload
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Supports .sql files up to 50MB</p>
          </div>
          <input {...getInputProps()} data-testid="file-input" />
        </div>

        {/* File Info Display */}
        {uploadedFile && (
          <div className="mt-4 p-4 bg-muted rounded-lg" data-testid="file-info">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileCode className="text-primary text-lg" />
                <div>
                  <p className="font-medium text-foreground" data-testid="file-name">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid="file-details">
                    {formatFileSize(uploadedFile.size)} • {formatLastModified(uploadedFile.lastModified)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="text-destructive hover:text-destructive/80"
                data-testid="remove-file-button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {uploadMutation.isPending && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <p className="text-sm text-blue-800">Uploading your SQL file...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
