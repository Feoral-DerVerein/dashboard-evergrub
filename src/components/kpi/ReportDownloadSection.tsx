
import React from 'react';
import { Download, Lock } from "lucide-react";

export const ReportDownloadSection = () => {
  return (
    <>
      <button className="w-full bg-emerald-600 text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 mb-6">
        <Download className="w-5 h-5" />
        Download Report
      </button>

      <div className="text-center text-sm text-gray-500 space-y-2 mb-6">
        <div className="flex items-center justify-center gap-1">
          <span>2.4 MB</span>
          <span>•</span>
          <span>PDF Document</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <Lock className="w-4 h-4" />
          <span>This file is secure and encrypted</span>
        </div>
      </div>
    </>
  );
};

export default ReportDownloadSection;
