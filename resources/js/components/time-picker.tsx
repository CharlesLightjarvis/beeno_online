import { Input } from '@/components/ui/input';

export function TimePicker({
    name,
    defaultValue,
    id = name,
}: {
    name: string;
    defaultValue?: string | null;
    id?: string;
}) {
    return (
        <Input
            type="time"
            id={id}
            name={name}
            step="60"
            defaultValue={defaultValue?.slice(0, 5) ?? ''}
            className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
    );
}
