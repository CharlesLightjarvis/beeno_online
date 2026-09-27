import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function DatePicker({
    name,
    defaultValue,
    placeholder = 'Choisir une date',
}: {
    name: string;
    defaultValue?: Date;
    placeholder?: string;
}) {
    const [date, setDate] = useState<Date | undefined>(defaultValue);
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <input
                type="hidden"
                name={name}
                value={date ? format(date, 'yyyy-MM-dd') : ''}
            />
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                    )}
                >
                    <CalendarIcon />
                    {date ? format(date, 'PPP', { locale: fr }) : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selected) => {
                        setDate(selected);
                        setOpen(false);
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
