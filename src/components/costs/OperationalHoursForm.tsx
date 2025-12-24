
import { Button } from "@/components/ui/button";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Clock, Loader2 } from 'lucide-react';
import type { OperationalHours } from '@/types/costs';
import { daysOfWeek } from '@/types/costs';

interface OperationalHoursFormProps {
    operationalHours: Omit<OperationalHours, 'id' | 'user_id' | 'created_at'>;
    selectedDays: { [key: string]: boolean };
    onDayToggle: (dayKey: string) => void;
    onHourChange: (day: string, type: 'start' | 'end', value: string) => void;
    onSaveHours: () => void;
    isSaving: boolean;
}

export const OperationalHoursForm = ({
    operationalHours,
    selectedDays,
    onDayToggle,
    onHourChange,
    onSaveHours,
    isSaving,
}: OperationalHoursFormProps) => {
    return (
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Horas Trabalhadas</h3>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Defina seus dias e horários de funcionamento.
            </p>
            <div className="space-y-3">
                {daysOfWeek.map(day => (
                    <div key={day.key} className="flex items-center gap-2">
                        <Checkbox
                            id={day.key}
                            checked={selectedDays[day.key]}
                            onCheckedChange={() => onDayToggle(day.key)}
                        />
                        <Label htmlFor={day.key} className="w-12 text-slate-700 dark:text-slate-300">{day.label}:</Label>
                        <Input
                            type="time"
                            value={operationalHours[`${day.key}_start` as keyof typeof operationalHours] || ''}
                            onChange={(e) => onHourChange(day.key, 'start', e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            disabled={!selectedDays[day.key]}
                        />
                        <span className="text-slate-400">-</span>
                        <Input
                            type="time"
                            value={operationalHours[`${day.key}_end` as keyof typeof operationalHours] || ''}
                            onChange={(e) => onHourChange(day.key, 'end', e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            disabled={!selectedDays[day.key]}
                        />
                    </div>
                ))}
            </div>
            <Button
                onClick={onSaveHours}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
                disabled={isSaving}
            >
                {isSaving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                    </>
                ) : "Salvar Horários"}
            </Button>
        </div>
    );
};
