
import { Button } from "@/components/ui/button";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Clock, Loader2, Save } from 'lucide-react';
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
        <div className="space-y-4 pt-4">
            {/* Title moved to CardHeader in parent */}
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
                            className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                        />
                        <Label htmlFor={day.key} className="w-12 text-slate-700 dark:text-slate-300">{day.label}:</Label>
                        <div className="flex items-center gap-2 flex-1">
                            <Input
                                type="time"
                                value={operationalHours[`${day.key}_start` as keyof typeof operationalHours] || ''}
                                onChange={(e) => onHourChange(day.key, 'start', e.target.value)}
                                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                disabled={!selectedDays[day.key]}
                            />
                            <span className="text-slate-400">-</span>
                            <Input
                                type="time"
                                value={operationalHours[`${day.key}_end` as keyof typeof operationalHours] || ''}
                                onChange={(e) => onHourChange(day.key, 'end', e.target.value)}
                                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                disabled={!selectedDays[day.key]}
                            />
                            <Clock className="w-4 h-4 text-slate-400" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end pt-4">
                <Button
                    onClick={onSaveHours}
                    className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-medium"
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Horários
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};
