import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useLogger } from '../../hooks/use-logger';
import type { TaskCreateDto, TaskDto } from '../../model/task-dto';
import { taskService } from '../../services/task-service';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: TaskDto) => void;
  courseId: string;
}

export function CreateTaskModal({ isOpen, onClose, onTaskCreated, courseId }: CreateTaskModalProps) {
  const logger = useLogger("CreateTaskModal");
  const [formData, setFormData] = useState<TaskCreateDto>({
    title: '',
    description: '',
    keywords: '',
    minGrade: undefined
  });

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      logger.warn("Název úkolu je povinný");
      return;
    }

    logger.info("Vytvářím nový úkol", { title: formData.title });
    const newTask: TaskCreateDto = {
      title: formData.title,
      description: formData.description,
      keywords: formData.keywords,
      minGrade: formData.minGrade
    };

    const ret = await taskService.create(courseId, newTask);
    onTaskCreated(ret);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      keywords: '',
      minGrade: undefined
    });
    onClose();
  };

  const handleInputChange = (field: keyof TaskCreateDto, value: string | number | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            Vytvořit nový úkol
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Název úkolu */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Název úkolu *
              </label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Zadejte název úkolu"
              />
            </div>

            {/* Popis */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Popis
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Zadejte popis úkolu"
              />
            </div>

            {/* Klíčová slova */}
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
                Klíčová slova
              </label>
              <input
                id="keywords"
                type="text"
                value={formData.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Zadejte klíčová slova oddělená čárkami"
              />
            </div>

            {/* Minimální známka */}
            <div>
              <label htmlFor="minGrade" className="block text-sm font-medium text-gray-700 mb-1">
                Minimální hodnota úkolu
              </label>
              <input
                id="minGrade"
                type="number"
                min="0"
                max="1000"
                value={formData.minGrade || ''}
                onChange={(e) => handleInputChange('minGrade', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0-1000"
              />
            </div>

            {/* Tlačítka */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Zrušit
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Vytvořit úkol
              </button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Zavřít"
            >
              <span className="sr-only">Zavřít</span>
              ✕
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
