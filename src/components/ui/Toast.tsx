'use client';

import { useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const toastStyles = {
  success: {
    container: 'bg-gray-800/95 border-green-500/50 text-green-300',
    icon: CheckCircleIcon,
    iconColor: 'text-green-400',
  },
  error: {
    container: 'bg-gray-800/95 border-red-500/50 text-red-300',
    icon: XCircleIcon,
    iconColor: 'text-red-400',
  },
  warning: {
    container: 'bg-gray-800/95 border-yellow-500/50 text-yellow-300',
    icon: ExclamationTriangleIcon,
    iconColor: 'text-yellow-400',
  },
  info: {
    container: 'bg-gray-800/95 border-blue-500/50 text-blue-300',
    icon: InformationCircleIcon,
    iconColor: 'text-blue-400',
  },
};

export default function Toast({ id, message, type, duration = 4000, onClose }: ToastProps) {
  const style = toastStyles[type];
  const Icon = style.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-2xl
        backdrop-blur-lg transition-all duration-300
        animate-slide-in-right
        ${style.container}
      `}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${style.iconColor}`} />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Close notification"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
