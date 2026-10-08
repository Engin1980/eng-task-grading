import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useState, useCallback, useEffect } from "react";
import { Turnstile } from "../../components/turnstille";
import { SuccessModal } from "../../components/studentView/SuccessModal";
import AppSettings from "../../config/app-settings";
import type { StudentViewLoginDto } from "../../model/student-view-dto";
import { studentViewService } from "../../services/student-view-service";
import { useToast } from "../../hooks/use-toast";
import { useLogger } from "../../hooks/use-logger";
import { Trans, useTranslation } from "react-i18next";

export const Route = createFileRoute("/studentView/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const tst = useToast();
  const logger = useLogger("/studentView/login.tsx");

  // Cloudflare konfigurace z AppSettings
  const isCloudflareEnabled = AppSettings.cloudflare.enabled;
  const TURNSTILE_SITE_KEY = AppSettings.cloudflare.siteKey;

  // Toast upozornění pokud chybí site key (pouze pokud je Cloudflare enabled)
  useEffect(() => {
    if (isCloudflareEnabled && !TURNSTILE_SITE_KEY) {
      tst.error(t("login.siteKeyMissing"));
    }
  }, [isCloudflareEnabled, TURNSTILE_SITE_KEY]);

  // Stabilní callback pro captcha aby se neměnil při každém re-renderu
  const handleCaptchaVerify = useCallback((token: string) => {
    setCaptchaToken(token);
  }, []);

  const form = useForm({
    defaultValues: {
      studentNumber: "",
    },
    onSubmit: async ({ value }) => {
      // Kontrola captcha pouze pokud je Cloudflare enabled
      if (isCloudflareEnabled && !captchaToken) {
        tst.warning(tst.WRN.CAPTCHA_COMPLETION_NEEDED);
        return;
      }

      setIsSubmitting(true);
      try {
        const data: StudentViewLoginDto = {
          studentNumber: value.studentNumber,
          captchaToken: isCloudflareEnabled
            ? captchaToken || undefined
            : undefined,
        };

        await studentViewService.login(data);
        setShowSuccessModal(true);
        form.reset();
        setCaptchaToken(null); // Reset captcha token po úspěšném odeslání
      } catch (error) {
        logger.error("Login error:", error);
        tst.error(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
          {t("login.title")}
        </h1>
        <p className="text-center text-gray-600 text-sm mb-6">
          {t("login.instructions.line1")}
          <br />
          {t("login.instructions.line2")}
          <br />
          {t("login.instructions.line3")}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="studentNumber"
            validators={{
              onChange: ({ value }) => {
                if (!value || value.trim().length === 0) {
                  return t("login.required");
                }

                const studentNumberRegex = /^[A-Za-z]\d{5}$/;
                if (!studentNumberRegex.test(value.trim())) {
                  return t("login.invalidFormat");
                }

                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="studentNumber"
                >
                  {t("login.studentNumber")}
                </label>
                <input
                  id="studentNumber"
                  name={field.name}
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("login.placeholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Turnstile Captcha */}
          {isCloudflareEnabled && (
            <div>
              {TURNSTILE_SITE_KEY ? (
                <Turnstile
                  siteKey={TURNSTILE_SITE_KEY}
                  onVerify={handleCaptchaVerify}
                />
              ) : (
                <div className="text-red-600 text-sm text-center py-4">
                  {t("login.siteKeyMissing")}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !form.state.canSubmit ||
              (isCloudflareEnabled && !captchaToken)
            }
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t("login.submitting") : t("login.submit")}
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-4">
          <Trans
            t={t}
            i18nKey="login.isTeacher"
            components={{ a: <a href="/login" className="text-blue-500 hover:underline" /> }}
          />
        </p>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t("login.successTitle")}
        message={t("login.successMessage")}
      />
    </>
  );
}
