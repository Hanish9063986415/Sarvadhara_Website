'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { crmProjectToInput } from '@/lib/crm-project-api-parse'
import { taskMeterAverage, type CrmProject, type CrmTask } from '@/types/crm-project'

function MeterBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-400 to-platinum-metallic"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export default function ProjectNotesTasks({
  project,
  onSaved,
}: {
  project: CrmProject
  onSaved: (project: CrmProject) => void
}) {
  const [notes, setNotes] = useState(project.notes)
  const [tasks, setTasks] = useState<CrmTask[]>(project.tasks ?? [])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [meter, setMeter] = useState(0)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setNotes(project.notes)
    setTasks(project.tasks ?? [])
  }, [project.id, project.updatedAt, project.notes, project.tasks])

  const notesDirty = notes !== project.notes
  const average = taskMeterAverage(tasks)

  async function persist(next: { notes: string; tasks: CrmTask[] }, success: string) {
    setSaving(true)
    setMessage(null)
    const res = await fetch(`/api/automate/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(crmProjectToInput({ ...project, notes: next.notes, tasks: next.tasks })),
    })
    setSaving(false)
    if (!res.ok) {
      setMessage('Could not save. Try again.')
      return false
    }
    const data = (await res.json()) as { project: CrmProject }
    onSaved(data.project)
    setMessage(success)
    return true
  }

  async function saveNotes() {
    await persist({ notes, tasks }, 'Notes saved')
  }

  async function addTask(event: React.FormEvent) {
    event.preventDefault()
    const name = title.trim()
    if (!name) return
    const next = [
      ...tasks,
      {
        id: crypto.randomUUID(),
        title: name,
        description,
        meter,
      },
    ]
    const ok = await persist({ notes, tasks: next }, 'Task added')
    if (ok) {
      setTitle('')
      setDescription('')
      setMeter(0)
    }
  }

  async function updateTask(id: string, patch: Partial<CrmTask>) {
    const next = tasks.map((task) => (task.id === id ? { ...task, ...patch } : task))
    setTasks(next)
    await persist({ notes, tasks: next }, 'Task updated')
  }

  async function removeTask(id: string) {
    const next = tasks.filter((task) => task.id !== id)
    setTasks(next)
    await persist({ notes, tasks: next }, 'Task removed')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.16em] text-platinum-500">Notes</h3>
            <p className="mt-1 text-xs text-platinum-500">Paste any text. Line breaks stay as you pasted them.</p>
          </div>
          <button
            type="button"
            onClick={saveNotes}
            disabled={saving || !notesDirty}
            className="rounded-xl border border-platinum-300/30 bg-platinum-metallic/10 px-3 py-2 text-[10px] uppercase tracking-wider text-platinum-metallic disabled:opacity-40"
          >
            {saving && notesDirty ? 'Saving…' : 'Save notes'}
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={14}
          placeholder="Paste a brief, call notes, links, or any text here"
          className="crm-input mt-4 min-h-[280px] resize-y whitespace-pre-wrap font-sans text-sm leading-relaxed"
        />
        <p className="mt-2 text-[11px] text-platinum-600">{notes.length.toLocaleString('en-IN')} characters</p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.16em] text-platinum-500">Task meter</h3>
            <p className="mt-1 text-xs text-platinum-500">Add a task, describe it, and set how far it has moved.</p>
          </div>
          <p className="crm-stat-lg">{average}%</p>
        </div>
        <div className="mt-3">
          <MeterBar value={average} />
          <p className="mt-2 text-[11px] text-platinum-600">
            {tasks.length === 0 ? 'No tasks yet' : `${tasks.length} task${tasks.length === 1 ? '' : 's'} · average meter`}
          </p>
        </div>

        <form onSubmit={addTask} className="mt-5 space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
          <div>
            <label className="crm-label" htmlFor="new-task-title">
              Task
            </label>
            <input
              id="new-task-title"
              className="crm-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What needs to be done"
              required
            />
          </div>
          <div>
            <label className="crm-label" htmlFor="new-task-description">
              Description
            </label>
            <textarea
              id="new-task-description"
              rows={3}
              className="crm-input resize-y whitespace-pre-wrap leading-relaxed"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Details, owners, or links"
            />
          </div>
          <div>
            <label className="crm-label" htmlFor="new-task-meter">
              Meter — {meter}%
            </label>
            <input
              id="new-task-meter"
              type="range"
              min={0}
              max={100}
              value={meter}
              onChange={(event) => setMeter(Number(event.target.value))}
              className="mt-2 w-full accent-violet-400"
            />
          </div>
          <button type="submit" disabled={saving} className="crm-primary-btn inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add task
          </button>
        </form>

        <ul className="mt-4 space-y-3">
          {tasks.map((task) => (
            <li key={task.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-platinum-200">{task.title}</p>
                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="rounded-lg p-1.5 text-platinum-500 hover:bg-red-500/10 hover:text-red-300"
                  aria-label={`Remove ${task.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                rows={2}
                className="crm-input mt-3 resize-y whitespace-pre-wrap text-sm leading-relaxed"
                defaultValue={task.description}
                key={`${task.id}-${task.description}`}
                placeholder="Description"
                onBlur={(event) => {
                  if (event.target.value !== task.description) {
                    updateTask(task.id, { description: event.target.value })
                  }
                }}
              />
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[11px] text-platinum-500">
                  <span>Meter</span>
                  <span className="crm-stat-sm">{task.meter}%</span>
                </div>
                <MeterBar value={task.meter} />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={task.meter}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    setTasks((list) => list.map((item) => (item.id === task.id ? { ...item, meter: value } : item)))
                  }}
                  onPointerUp={(event) => {
                    const value = Number((event.target as HTMLInputElement).value)
                    updateTask(task.id, { meter: value })
                  }}
                  className="mt-2 w-full accent-violet-400"
                />
              </div>
            </li>
          ))}
        </ul>
        {message && <p className="mt-3 text-xs text-platinum-400">{message}</p>}
      </section>
    </div>
  )
}
