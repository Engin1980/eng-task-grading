import { useEffect, useState } from 'react';
import { useToast } from '../../hooks/use-toast';

interface StudentGroupInputProps {
  value: string;
  onSave: (value: string) => Promise<void>;
}

export function StudentGroupInput({ value, onSave }: StudentGroupInputProps) {
  const toast = useToast();
  const [text, setText] = useState(value);
  const [saving, setSaving] = useState(false);
  const isDirty = text !== value;

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setText(value);
      return;
    }
    if (e.key !== 'Enter' || !isDirty || saving) return;

    try {
      setSaving(true);
      await onSave(text.trim());
      toast.success(toast.SUC.ITEM_UPDATED);
    } catch (error) {
      toast.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <input
      type="text"
      value={text}
      disabled={saving}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      className={`w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDirty ? 'bg-yellow-100' : 'bg-white'}`}
    />
  );
}
