import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AppDialog } from '../../ui/AppDialog';

interface DeleteModalProps {
  title: string;
  question: string;
  verification: string;
  isOpen: boolean;
  onDelete: (confirmed: boolean) => void;
  onClose: () => void;
}

export function DeleteModal(props: DeleteModalProps) {
  const { t } = useTranslation();
  const [enteredVerification, setEnteredVerification] = React.useState<string>('');

  if (!props.isOpen || !props.verification) return null;

  return (
    <AppDialog
      title={props.title}
      titleColor='red'
      isOpen={props.isOpen}
      confirmButtonText={t("deletePermanently")}
      confirmButtonColor='red'
      confirmButtonEnabled={() => enteredVerification === props.verification}
      onSubmit={() => props.onDelete(true)}
      onClose={() => props.onClose()}
    >
      <div className="px-6 py-4">

        <div className="mb-4 text-gray-700 bg-red-100 p-3 rounded-lg">
          {props.question}
        </div>

        <div className="mb-4">
          <label htmlFor="enteredVerification" className="block text-sm font-medium text-gray-700 mb-2">
            <Trans i18nKey="deleteVerifyPrompt" values={{ verification: props.verification }} components={{ code: <code /> }} />
          </label>
          <input
            id="enteredVerification"
            type="text"
            name="enteredVerification"
            value={enteredVerification}
            onChange={(e) => setEnteredVerification(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={t("deleteVerifyPlaceholder")}
            required
            autoFocus
          />
        </div>
      </div>
    </AppDialog>
  );
}