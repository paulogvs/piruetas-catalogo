import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const base = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all focus:outline-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
        primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-sm',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
        outline: 'border-2 border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-600',
        danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
    };

    const sizes = {
        sm: 'h-9 px-4 text-sm gap-1.5',
        md: 'h-11 px-5 text-sm gap-2',
        lg: 'h-13 px-6 text-base gap-2',
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
        </button>
    );
}
