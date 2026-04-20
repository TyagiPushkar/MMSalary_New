import { useState } from 'react'
import PageTitle from '../components/shared/PageTitle'

function SettingsPage() {
  const [officeName, setOfficeName] = useState('Namami Infotech')
  const [autoSync, setAutoSync] = useState(true)

  return (
    <section>
      <PageTitle title="Settings" subtitle="Super role configuration page." />
      <div className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Office Name</label>
          <input
            value={officeName}
            onChange={(event) => setOfficeName(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <label className="flex items-center gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={autoSync}
            onChange={(event) => setAutoSync(event.target.checked)}
          />
          Enable daily auto sync
        </label>
      </div>
    </section>
  )
}

export default SettingsPage
