import { useTranslation } from "react-i18next";

type LoadingProps = {
  message?: string;
};

export const Loading: React.FC<LoadingProps> = ({ message }) => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{message || t("loading")}</p>
        </div>
      </div>
    </div>
  );
};