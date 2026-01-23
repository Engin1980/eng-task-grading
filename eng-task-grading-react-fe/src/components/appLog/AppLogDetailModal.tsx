import { useState } from "react";
import type { AppLogDto } from "../../model/applog-dto";
import * as Dialog from '@radix-ui/react-dialog';
import { LogPropertiesViewer } from "../../ui/logPropertiesViewer";

interface AppLogDetailModalProps {
  isOpen: boolean;
  logs: AppLogDto[];
  index: number;
  onClose: () => void;
}

export function AppLogDetailModal(props: AppLogDetailModalProps) {
  const [currentIndex, setCurrentIndex] = useState(props.index);

  const currentLog = props.logs[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === props.logs.length - 1;

  const handlePrevious = () => {
    if (!isFirst) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (!isLast) {
      setCurrentIndex(currentIndex + 1);
    };
  };

  const handleFirst = () => {
    setCurrentIndex(0);
  };

  if (!currentLog) {
    return null;
  }

  return (

    <Dialog.Root open={props.isOpen} onOpenChange={props.onClose} >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-lg flex flex-col">
          <div className="flex justify-between items-center p-6 pb-4 border-b flex-shrink-0">
            <Dialog.Title className="text-lg font-semibold text-blue-600">
              Log Detail ({currentIndex + 1} / {props.logs.length})
            </Dialog.Title>
          </div>

          <div className="overflow-y-auto flex-1 p-6">
            <div className="space-y-4">
              <div>
                <strong className="block text-sm font-semibold mb-1">ID:</strong>
                <div className="text-sm">{currentLog.id}</div>
              </div>

              <div>
                <strong className="block text-sm font-semibold mb-1">Level:</strong>
                <div className="text-sm">{currentLog.level || "N/A"}</div>
              </div>

              <div>
                <strong className="block text-sm font-semibold mb-1">SourceContext:</strong>
                <div className="text-sm">{currentLog.sourceContext || "N/A"}</div>
              </div>

              <div>
                <strong className="block text-sm font-semibold mb-1">Timestamp:</strong>
                <div className="text-sm">
                  {currentLog.timeStamp ? new Date(currentLog.timeStamp).toLocaleString() : "N/A"}
                </div>
              </div>

              <div>
                <strong className="block text-sm font-semibold mb-1">Message:</strong>
                <div className="text-sm whitespace-pre-wrap">{currentLog.message || "N/A"}</div>
              </div>

              <div>
                <strong className="block text-sm font-semibold mb-1">Message Template:</strong>
                <div className="text-sm whitespace-pre-wrap">{currentLog.messageTemplate || "N/A"}</div>
              </div>

              {currentLog.exception && (
                <div>
                  <strong className="block text-sm font-semibold mb-1">Exception:</strong>
                  <div className="text-sm whitespace-pre font-mono bg-red-50 p-3 rounded border border-red-200 overflow-x-auto">
                    {currentLog.exception}
                  </div>
                </div>
              )}

              {currentLog.properties && (
                <div>
                  <strong className="block text-sm font-semibold mb-1">Properties:</strong>
                  <div className="text-sm whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded border border-gray-200">
                    <LogPropertiesViewer xmlData={currentLog.properties} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 p-6 pt-4 border-t flex-shrink-0">
            <button
              onClick={handleFirst}
              disabled={isFirst}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Na začátek
            </button>
            <button
              onClick={handlePrevious}
              disabled={isFirst}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Zpět
            </button>
            <button
              onClick={handleNext}
              disabled={isLast}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Vpřed
            </button>
          </div>

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
    </Dialog.Root >
  );
}
