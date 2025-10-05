import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';

interface AppDialogProps {
  title: string;
  titleColor?: string;
  isOpen: boolean;
  confirmButtonText: string;
  confirmButtonColor?: string;
  confirmButtonEnabled: () => boolean;
  onSubmit: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

export function AppDialog(props: AppDialogProps) {

  if (!props.titleColor)
    props = { ...props, titleColor: "gray" };
  if (!props.confirmButtonColor)
    props = { ...props, confirmButtonColor: "blue" };

  function handleClose() {
    props.onClose();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      props.onSubmit();
    } catch (err) {
      return;
    }
    props.onClose();
  }

  if (!props.isOpen) return null;

  return (
    <Dialog.Root open={props.isOpen} onOpenChange={handleClose} >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className={`text-lg font-semibold text-${props.titleColor}-600 mb-4`}>
            {props.title}
          </Dialog.Title>
          <form onSubmit={handleSubmit}>
            <div>
              {props.children}
            </div>
            {/* Action buttons */}
            <div className="bg-gray-50 px-6 py-3 flex flex-row-reverse gap-3">
              <button
                type="submit"
                className={`inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-${props.confirmButtonColor}-600 text-base font-medium text-white hover:bg-${props.confirmButtonColor}-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={!props.confirmButtonEnabled()}
              >
                {props.confirmButtonText}
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