import React from 'react';
import { AppDialog } from '../../ui/AppDialog';

interface DeleteModalProps {
  title: string;
  question: string;
  verification: string;
  isOpen: boolean;
  onClose: (isCompleted: boolean) => void;
}

export function DeleteModal(props: DeleteModalProps) {
  const [enteredVerification, setEnteredVerification] = React.useState<string>('');

  if (!props.isOpen || !props.verification) return null;

  return (
    <AppDialog
      title={props.title}
      titleColor='red'
      isOpen={props.isOpen}
      confirmButtonText="Nevratně smazat"
      confirmButtonColor='red'
      confirmButtonEnabled={() => enteredVerification === props.verification}
      onSubmit={() => props.onClose(true)}
      onClose={() => props.onClose(false)}
    >
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
    </AppDialog>
  );
}