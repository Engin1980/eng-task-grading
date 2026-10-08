import { createFileRoute, Link } from '@tanstack/react-router'
import { QRCodeSVG } from 'qrcode.react'
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/attendanceSelfSign/view-info/$id/$key')({
  component: ViewInfoComponent,
})

function ViewInfoComponent() {
  const { t } = useTranslation('attendances')
  const { id, key } = Route.useParams()
  const selfSignUrl = window.location.origin + `/attendanceSelfSign/self-sign/${id}?key=${key}`

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('viewInfo.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('viewInfo.subtitle')}
          </p>
        </div>

        <div className="px-6 py-4">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('viewInfo.key')}
              </label>
              <div className="bg-gray-100 px-4 py-3 rounded-md">
                <span className="font-mono text-lg text-gray-900">{key}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('viewInfo.link')}
              </label>
              <div className="bg-blue-50 px-4 py-3 rounded-md">
                <Link
                  to="/attendanceSelfSign/self-sign/$id"
                  params={{ id }}
                  search={{ key }}
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  {selfSignUrl}
                </Link>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('viewInfo.qr')}
              </label>
              <div className="bg-white border-2 border-gray-200 rounded-md p-4 flex justify-center">
                <QRCodeSVG
                  value={selfSignUrl}
                  size={200}
                  level="M"
                  className="border border-gray-100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {t('viewInfo.qrNote')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}