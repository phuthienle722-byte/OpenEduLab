import React, { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const BaseComponent = (React.Component as unknown) as new (props: ErrorBoundaryProps) => {
  props: ErrorBoundaryProps;
  state: ErrorBoundaryState;
  setState: (state: Partial<ErrorBoundaryState>) => void;
};

export class ErrorBoundary extends BaseComponent {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl border border-rose-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {this.props.fallbackTitle || 'Đã xảy ra sự cố khi tải nội dung này'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {this.state.error?.message || 'Lỗi không xác định trong quá trình xử lý dữ liệu.'}
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-[#0785F9] hover:bg-[#006FE6] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Thử lại</span>
              </button>
              {this.props.onReset && (
                <button
                  onClick={this.props.onReset}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Đóng</span>
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
