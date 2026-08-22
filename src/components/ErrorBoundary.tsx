import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Compass, RotateCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('GlobeTrotter ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = (): void => {
    try {
      localStorage.removeItem('globetrotter_user');
      localStorage.removeItem('globetrotter_trips');
      localStorage.removeItem('app_currency');
    } catch {
      // Ignore
    }
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F1E8] text-[#2C221E] flex items-center justify-center p-6">
          <div className="editorial-card p-8 sm:p-12 max-w-lg w-full text-center space-y-6 shadow-xl border border-[#EAE2D5]">
            <div className="w-16 h-16 rounded-3xl bg-[#964223] text-white flex items-center justify-center mx-auto shadow-md">
              <Compass className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#2C221E]">
                Something unexpected happened
              </h1>
              <p className="text-xs sm:text-sm text-[#6B5E55] leading-relaxed">
                GlobeTrotter encountered an issue while loading this page. You can try refreshing or resetting your session.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-left text-xs text-rose-900 font-mono overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl btn-glass-primary text-xs font-bold shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl border border-[#D9CBBA] bg-white hover:bg-[#FAF7F2] text-[#2C221E] text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
