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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-white/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal panel */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit}>

          <div className="px-6 py-4">
            {/* Title */}
            {/* New grade value */}
            <div className="mb-4">
              <label htmlFor="enteredVerification" className="block text-sm font-medium text-gray-700 mb-2">
                {props.question}<span className="text-red-500">*</span> <br />
                Pro smazání zadejte: <br /><code>{props.verification}</code>
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
      </div>
    </div>
  );
}