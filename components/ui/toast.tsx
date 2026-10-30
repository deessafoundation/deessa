import { toast, type ToastT } from 'sonner';
import { cn } from '@/lib/utils';

// Types for toast options
export interface ToastOptions extends Partial<ToastT> {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Toast types and their configurations
const toastStyles = {
  success: {
    icon: (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-sm shadow-green-500/20">
        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ),
    className: 'bg-[#f0fdf4] border-green-200/80',
    progressBarClass: 'bg-gradient-to-r from-green-500 to-emerald-500',
    shadowClass: 'shadow-lg shadow-green-950/5',
  },
  error: {
    icon: (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-sm shadow-red-500/20">
        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    ),
    className: 'bg-[#fef2f2] border-red-200/80',
    progressBarClass: 'bg-gradient-to-r from-red-500 to-rose-500',
    shadowClass: 'shadow-lg shadow-red-950/5',
  },
  warning: {
    icon: (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-sm shadow-amber-500/20">
        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    ),
    className: 'bg-[#fffbeb] border-yellow-200/80',
    progressBarClass: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    shadowClass: 'shadow-lg shadow-amber-950/5',
  },
  info: {
    icon: (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-500/20">
        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
    className: 'bg-[#eff6ff] border-blue-200/80',
    progressBarClass: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    shadowClass: 'shadow-lg shadow-blue-950/5',
  },
} as const;

// Custom toast component with progress bar
const ToastMessage = ({ 
  title, 
  description, 
  type = 'info',
  duration = 2500,
  action,
  onAutoClose 
}: { 
  title: string; 
  description?: string; 
  type: keyof typeof toastStyles;
  duration: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onAutoClose?: () => void;
}) => {
  const style = toastStyles[type];

  return (
    <div className={cn(
      "relative flex w-full items-start gap-3.5 overflow-hidden rounded-2xl p-4",
      "border bg-white shadow-lg transition-all duration-300 hover:shadow-xl",
      "animate-in slide-in-from-top-2 fade-in-0 zoom-in-95",
      style.className,
      style.shadowClass
    )}>
      {/* Icon with animated gradient background */}
      <div className="flex-shrink-0 animate-in zoom-in-50 duration-300">
        {style.icon}
      </div>

      {/* Content with animated entrance */}
      <div className="flex-1 min-w-0 animate-in slide-in-from-right-1 duration-300 pr-1">
        <h3 className="font-semibold text-[15px] leading-5 tracking-tight mb-1 text-slate-900">
          {title}
        </h3>
        {description && (
          <p className="text-sm leading-relaxed text-slate-700">
            {description}
          </p>
        )}
        {action && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
            className="mt-2 text-xs font-semibold text-slate-800 underline underline-offset-2 hover:text-slate-950 cursor-pointer"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Animated progress bar */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 h-1 rounded-b-2xl",
          style.progressBarClass
        )}
        style={{
          width: '100%',
          transition: `width ${duration}ms linear`,
        }}
        ref={(el) => {
          if (el) {
            // Trigger the animation by setting width to 0 after a short delay
            setTimeout(() => {
              el.style.width = '0%';
            }, 10);
          }
        }}
        onTransitionEnd={onAutoClose}
      />
    </div>
  );
};

// Main toast functions
export const showToast = {
  /**
   * Show a success toast notification
   */
  success: (options: ToastOptions) => {
    const { title, description, duration, action, ...rest } = options;
    return toast.custom((t) => (
      <ToastMessage
        type="success"
        title={title || 'Success'}
        description={description}
        duration={duration || 2500}
        action={action}
        onAutoClose={() => toast.dismiss(t)}
      />
    ), {
      duration: duration || 2500,
      ...rest,
    });
  },

  /**
   * Show an error toast notification
   */
  error: (options: ToastOptions) => {
    const { title, description, duration, action, ...rest } = options;
    return toast.custom((t) => (
      <ToastMessage
        type="error"
        title={title || 'Error'}
        description={description}
        duration={duration || 2500}
        action={action}
        onAutoClose={() => toast.dismiss(t)}
      />
    ), {
      duration: duration || 2500,
      ...rest,
    });
  },

  /**
   * Show a warning toast notification
   */
  warning: (options: ToastOptions) => {
    const { title, description, duration, action, ...rest } = options;
    return toast.custom((t) => (
      <ToastMessage
        type="warning"
        title={title || 'Warning'}
        description={description}
        duration={duration || 2500}
        action={action}
        onAutoClose={() => toast.dismiss(t)}
      />
    ), {
      duration: duration || 2500,
      ...rest,
    });
  },

  /**
   * Show an info toast notification
   */
  info: (options: ToastOptions) => {
    const { title, description, duration, action, ...rest } = options;
    return toast.custom((t) => (
      <ToastMessage
        type="info"
        title={title || 'Info'}
        description={description}
        duration={duration || 2500}
        action={action}
        onAutoClose={() => toast.dismiss(t)}
      />
    ), {
      duration: duration || 2500,
      ...rest,
    });
  },

  /**
   * Dismiss all currently visible toasts
   */
  dismiss: () => toast.dismiss(),

  /**
   * Show a promise-based toast that updates based on the promise state
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: ToastOptions
  ) => {
    const loadingToast = (
      <ToastMessage
        type="info"
        title="Loading"
        description={messages.loading}
        duration={options?.duration || 2500}
      />
    );

    return toast.promise(promise, {
      loading: loadingToast,
      success: (data) => (
        <ToastMessage
          type="success"
          title="Success"
          description={typeof messages.success === 'function' 
            ? messages.success(data)
            : messages.success}
          duration={options?.duration || 4000}
        />
      ),
      error: (error) => (
        <ToastMessage
          type="error"
          title="Error"
          description={typeof messages.error === 'function'
            ? messages.error(error)
            : messages.error}
          duration={options?.duration || 5000}
        />
      ),
    });
  },
};
