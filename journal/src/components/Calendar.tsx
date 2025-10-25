import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysInMonth, getFirstDayOfMonth, MONTH_NAMES, DAY_NAMES, formatDate } from '../utils/dateUtils';
import { Journal } from '../lib/supabase';

interface CalendarProps {
  year: number;
  month: number;
  selectedDate: Date | null;
  journals: Journal[];
  onDateSelect: (date: Date) => void;
  onMonthChange: (year: number, month: number) => void;
}

export default function Calendar({
  year,
  month,
  selectedDate,
  journals,
  onDateSelect,
  onMonthChange
}: CalendarProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const journalDates = new Set(journals.map(j => j.entry_date));

  const previousMonth = () => {
    if (month === 0) {
      onMonthChange(year - 1, 11);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      onMonthChange(year + 1, 0);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  const renderDays = () => {
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateStr = formatDate(currentDate);
      const isSelected = selectedDate && formatDate(selectedDate) === dateStr;
      const hasEntry = journalDates.has(dateStr);
      const isToday = formatDate(new Date()) === dateStr;

      days.push(
        <button
          key={day}
          onClick={() => onDateSelect(currentDate)}
          className={`
            aspect-square rounded-lg flex items-center justify-center
            relative transition-all duration-200 font-medium
            hover:scale-105 hover:shadow-md
            ${isSelected
              ? 'bg-amber-600 text-white shadow-lg scale-105'
              : isToday
              ? 'bg-amber-200 text-amber-900'
              : 'bg-white text-gray-700 hover:bg-amber-100'
            }
          `}
        >
          {day}
          {hasEntry && (
            <div className={`
              absolute bottom-1 w-1.5 h-1.5 rounded-full
              ${isSelected ? 'bg-white' : 'bg-amber-600'}
            `} />
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-amber-100 rounded-lg transition"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          {MONTH_NAMES[month]} {year}
        </h2>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-amber-100 rounded-lg transition"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {DAY_NAMES.map(day => (
          <div
            key={day}
            className="text-center text-xs md:text-sm font-semibold text-gray-600 pb-2"
          >
            {day}
          </div>
        ))}
        {renderDays()}
      </div>
    </div>
  );
}