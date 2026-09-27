import { cn } from '@/lib/utils';

/**
 * Visual progress bar clamped to 100% — the underlying value can exceed the
 * target (progression may go past 100% when the teacher overruns), so the
 * numeric label stays the source of truth next to it.
 */
export function ProgressBar({
    value,
    className,
}: {
    value: number;
    className?: string;
}) {
    const clamped = Math.min(Math.max(value, 0), 100);

    return (
        <div
            role="progressbar"
            aria-valuenow={Math.round(value)}
            aria-valuemin={0}
            aria-valuemax={100}
            className={cn(
                'h-2 w-full overflow-hidden rounded-full bg-muted',
                className,
            )}
        >
            <div
                style={{ width: `${clamped}%` }}
                className={cn(
                    'h-full rounded-full transition-colors',
                    value > 100
                        ? 'bg-amber-500'
                        : value >= 100
                          ? 'bg-emerald-500'
                          : 'bg-primary',
                )}
            />
        </div>
    );
}
