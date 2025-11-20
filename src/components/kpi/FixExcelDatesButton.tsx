import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useFixExcelDates } from '@/hooks/useFixExcelDates';

export const FixExcelDatesButton = () => {
  const { fixExcelDates, isFixing } = useFixExcelDates();

  return (
    <Button
      onClick={fixExcelDates}
      disabled={isFixing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Calendar className="h-4 w-4" />
      {isFixing ? 'Convirtiendo fechas...' : 'Convertir fechas de Excel'}
    </Button>
  );
};
