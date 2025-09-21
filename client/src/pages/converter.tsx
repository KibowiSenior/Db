import { useState } from "react";
import { Database, HelpCircle, Settings } from "lucide-react";
import FileUpload from "@/components/file-upload";
import AnalysisSection from "@/components/analysis-section";
import ValidationReport from "@/components/validation-report";
import CodeComparison from "@/components/code-comparison";
import DownloadSection from "@/components/download-section";
import { Button } from "@/components/ui/button";

export default function Converter() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Database className="text-primary-foreground text-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">SQL to MariaDB 10.3 Converter</h1>
                <p className="text-sm text-muted-foreground">Convert MySQL syntax to MariaDB 10.3 compatible format</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                data-testid="help-button"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                data-testid="settings-button"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <FileUpload onJobCreated={setCurrentJobId} />

        {currentJobId && (
          <>
            {/* Analysis Section */}
            <AnalysisSection jobId={currentJobId} />

            {/* Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Validation Report */}
              <div className="lg:col-span-1">
                <ValidationReport jobId={currentJobId} />
              </div>

              {/* Code Comparison */}
              <div className="lg:col-span-2">
                <CodeComparison jobId={currentJobId} />
              </div>
            </div>

            {/* Download Section */}
            <DownloadSection jobId={currentJobId} />
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              © 2024 SQL Converter Tool. Built for database migration professionals.
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
