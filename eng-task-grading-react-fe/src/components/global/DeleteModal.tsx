import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';

interface DeleteModalProps {
  title: string;
  question: string;
  verification: string;
  isOpen: boolean;
  onClose: (isCompleted: boolean) => void;
}

export function DeleteModal(props: DeleteModalProps) {
  const [enteredVerification, setEnteredVerification] = React.useState<string>('');

  function handleClose() {
    props.onClose(false);
  }

  function handleSubmit() {
  }

  if (!props.isOpen || !props.verification) return null;

  return (
    <Dialog.Root open={props.isOpen} onOpenChange={handleClose} >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-red-600 mb-4">
            {props.title}
          </Dialog.Title>
          <form onSubmit={handleSubmit}>

            <div className="px-6 py-4">

              <div className="mb-4 text-gray-700 bg-red-100 p-3 rounded-lg">
                {props.question}
              </div>

              <div className="mb-4">
                <label htmlFor="enteredVerification" className="block text-sm font-medium text-gray-700 mb-2">
                  Pro smazání zadejte <code>`{props.verification}`</code> a potvrďte formulář:
                </label>
                <input
                  id="enteredVerification"
                  type="text"
                  name="enteredVerification"
                  value={enteredVerification}
                  onChange={(e) => setEnteredVerification(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Doplňte pro potvrzení..."
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="bg-gray-50 px-6 py-3 flex flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={enteredVerification !== props.verification}
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Smazat
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Zrušit
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
    </Dialog.Root >
  );
}