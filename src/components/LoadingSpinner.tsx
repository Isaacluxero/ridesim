import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
};

export const LoadingSpinner = ({
    size = 'md',
    className,
    text
}: LoadingSpinnerProps) => {
    return (
        <div className="flex items-center justify-center gap-2">
            <Loader2 className={cn(
                'animate-spin text-primary',
                sizeClasses[size],
                className
            )} />
            {text && (
                <span className="text-sm text-muted-foreground">{text}</span>
            )}
        </div>
    );
};

export const LoadingOverlay = ({
    isLoading,
    children,
    text = 'Loading...'
}: {
    isLoading: boolean;
    children: React.ReactNode;
    text?: string;
}) => {
    if (!isLoading) return <>{children}</>;

    return (
        <div className="relative">
            {children}
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <LoadingSpinner size="lg" text={text} />
            </div>
        </div>
    );
}; 