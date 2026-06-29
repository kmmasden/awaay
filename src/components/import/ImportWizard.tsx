import { useState, useCallback } from 'react'
import { Upload, CheckCircle } from 'lucide-react'
import type { Member, ImportRow } from '../../types'
import { Modal } from '../shared/Modal'
import { parseFile, autoMapHeaders, processRows, APP_FIELDS } from '../../utils/import'
import { ColumnMapper } from './ColumnMapper'
import { ImportPreview } from './ImportPreview'
import { DuplicateReview } from './DuplicateReview'

type Step = 'upload' | 'map' | 'preview' | 'duplicates' | 'confirm' | 'done'

interface ImportWizardProps {
  existingMembers: Member[]
  onClose: () => void
  onImport: (rows: ImportRow[], existingMembers: Member[]) => Promise<ImportSummary>
}

export interface ImportSummary {
  added: number
  updated: number
  skipped: number
}

const STEP_LABELS: Record<Step, string> = {
  upload: '1. Upload File',
  map: '2. Match Columns',
  preview: '3. Review & Validate',
  duplicates: '4. Review Duplicates',
  confirm: '5. Confirm Import',
  done: '6. Import Complete',
}

export function ImportWizard({ existingMembers, onClose, onImport }: ImportWizardProps) {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<Record<string, keyof Member | ''>>({})
  const [rows, setRows] = useState<ImportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState<ImportSummary | null>(null)

  const handleFileSelect = async (f: File) => {
    setFile(f)
    setError('')
    setLoading(true)
    try {
      const { headers: h, rows: r } = await parseFile(f)
      if (r.length === 0) { setError('The file appears to be empty or could not be read.'); setLoading(false); return }
      setHeaders(h)
      setRawRows(r)
      setMapping(autoMapHeaders(h))
      setStep('map')
    } catch (err) {
      setError((err as Error).message)
    }
    setLoading(false)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFileSelect(f)
  }, [])

  const handleMappingConfirm = () => {
    const processed = processRows(rawRows, mapping, existingMembers)
    setRows(processed)
    const hasDuplicates = processed.some(r => r.duplicateOf)
    setStep(hasDuplicates ? 'duplicates' : 'preview')
  }

  const handleDuplicateResolution = (updatedRows: ImportRow[]) => {
    setRows(updatedRows)
    setStep('preview')
  }

  const handleOverrideRow = (index: number) => {
    setRows(prev => prev.map((r, i) => i === index ? { ...r, action: 'add', errors: [] } : r))
  }

  const handleImport = async () => {
    setLoading(true)
    const result = await onImport(rows, existingMembers)
    setSummary(result)
    setStep('done')
    setLoading(false)
  }

  const stepOrder: Step[] = ['upload', 'map', 'preview', 'duplicates', 'confirm', 'done']
  const stepIndex = stepOrder.indexOf(step)

  const addCount = rows.filter(r => r.action === 'add').length
  const updateCount = rows.filter(r => r.action === 'update').length
  const skipCount = rows.filter(r => r.action === 'skip').length
  const errorCount = rows.filter(r => r.errors.length > 0 && r.action !== 'skip').length
  const dupCount = rows.filter(r => r.duplicateOf).length

  return (
    <Modal title="Import Spreadsheet" onClose={onClose} size="xl">
      <div className="p-6">
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {(['upload', 'map', 'preview', 'confirm', 'done'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex items-center gap-1.5 ${i <= stepIndex ? 'text-[#1e3a5f]' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  i < stepIndex ? 'bg-[#1e3a5f] text-white' : i === stepIndex ? 'bg-[#1e3a5f] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < stepIndex ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span className="text-[14px] font-medium hidden sm:inline">{STEP_LABELS[s].replace(/^\d+\.\s/, '')}</span>
              </div>
              {i < 4 && <div className={`w-8 h-0.5 flex-shrink-0 ${i < stepIndex ? 'bg-[#1e3a5f]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step: Upload */}
        {step === 'upload' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your Spreadsheet</h3>
            <p className="text-gray-600 text-[16px] mb-6">
              Upload an Excel (.xlsx) or CSV (.csv) file with your member information.
            </p>
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-[#1e3a5f] transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-input')?.click()}
              role="button"
              aria-label="Click or drag a file here to upload"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('file-input')?.click()}
            >
              <Upload size={40} className="mx-auto text-gray-400 mb-4" aria-hidden="true" />
              <p className="text-[18px] font-semibold text-gray-700 mb-2">
                {loading ? 'Reading file...' : 'Click to browse, or drag a file here'}
              </p>
              <p className="text-[15px] text-gray-500">Supports Excel (.xlsx) and CSV (.csv) files</p>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="sr-only"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }}
                aria-label="Upload spreadsheet file"
              />
            </div>
            {error && <p className="mt-4 text-red-600 text-[16px]" role="alert">{error}</p>}

            {/* Template hint */}
            <div className="mt-6 bg-[#eef2f7] rounded p-4 text-[15px] text-[#1e3a5f]">
              <p className="font-semibold mb-1">Expected column names:</p>
              <p className="text-gray-600 leading-relaxed">
                {APP_FIELDS.filter(f => f.key).map(f => f.label).join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Step: Map Columns */}
        {step === 'map' && (
          <ColumnMapper
            headers={headers}
            mapping={mapping}
            onChange={setMapping}
            onBack={() => setStep('upload')}
            onConfirm={handleMappingConfirm}
            rowCount={rawRows.length}
            fileName={file?.name ?? ''}
          />
        )}

        {/* Step: Duplicates */}
        {step === 'duplicates' && (
          <DuplicateReview
            rows={rows}
            existingMembers={existingMembers}
            onBack={() => setStep('map')}
            onConfirm={handleDuplicateResolution}
          />
        )}

        {/* Step: Preview */}
        {step === 'preview' && (
          <ImportPreview
            rows={rows}
            onBack={() => setStep(dupCount > 0 ? 'duplicates' : 'map')}
            onConfirm={() => setStep('confirm')}
            onOverrideRow={handleOverrideRow}
          />
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to Import</h3>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
              <p className="text-[17px] text-gray-700 mb-4">Here's a summary of what will happen:</p>
              <ul className="space-y-2">
                <SummaryItem color="green" label="New members to add" count={addCount} />
                <SummaryItem color="blue" label="Existing members to update" count={updateCount} />
                <SummaryItem color="gray" label="Records to skip (invalid or duplicate)" count={skipCount} />
                {errorCount > 0 && <SummaryItem color="amber" label="Records with warnings" count={errorCount} />}
              </ul>
            </div>
            <p className="text-gray-600 text-[16px] mb-6">
              This will not overwrite any member information without your explicit approval for each record.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('preview')}
                className="px-5 py-2.5 rounded border border-gray-300 text-gray-700 font-medium text-[16px] hover:bg-gray-50 min-h-[44px]"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={addCount + updateCount === 0 || loading}
                className="px-6 py-2.5 rounded bg-[#1e3a5f] text-white font-semibold text-[16px] hover:bg-[#162d4a] min-h-[44px] disabled:opacity-50"
              >
                {loading ? 'Importing...' : `Import ${addCount + updateCount} Member${addCount + updateCount !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && summary && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={36} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Import Complete!</h3>
            <p className="text-[17px] text-gray-600 mb-6">Your spreadsheet has been imported successfully.</p>
            <div className="inline-flex flex-col gap-2 text-left bg-gray-50 rounded-lg p-5 border border-gray-200 mb-6">
              <SummaryItem color="green" label="Members added" count={summary.added} />
              <SummaryItem color="blue" label="Members updated" count={summary.updated} />
              <SummaryItem color="gray" label="Records skipped" count={summary.skipped} />
            </div>
            <div>
              <button
                onClick={onClose}
                className="px-8 py-3 rounded bg-[#1e3a5f] text-white font-semibold text-[17px] hover:bg-[#162d4a] min-h-[50px]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

function SummaryItem({ color, label, count }: { color: string; label: string; count: number }) {
  const colorClass = {
    green: 'text-green-700',
    blue: 'text-blue-700',
    gray: 'text-gray-600',
    amber: 'text-amber-700',
  }[color] ?? 'text-gray-700'

  return (
    <li className="flex items-center gap-3 text-[17px]">
      <span className={`font-bold text-xl w-8 text-right ${colorClass}`}>{count}</span>
      <span className="text-gray-700">{label}</span>
    </li>
  )
}
