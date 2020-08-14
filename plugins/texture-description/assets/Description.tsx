import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { fetch, t, notify } from 'blessing-skin'
import './Description.scss'

const el = document.querySelector<HTMLDivElement>('#texture-description')

function parseTid(): string {
  const { pathname } = location
  const matches = /(\d+)$/.exec(pathname)

  return matches?.[1] ?? '0'
}

const Description: React.FC = () => {
  const [description, setDescription] = useState('')
  const [raw, setRaw] = useState<string | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const getDescription = async () => {
      const tid = parseTid()
      const description: string = await fetch.get(`/textures/${tid}/desc`)
      setDescription(description)
    }
    getDescription()
  }, [])

  useEffect(() => {
    setCanEdit(el?.dataset?.canEdit === 'true')
  }, [])

  const handleEditContent = async (event: React.MouseEvent) => {
    event.preventDefault()
    if (raw === null) {
      const tid = parseTid()
      const response: string | { message: string } = await fetch.get(
        `/textures/${tid}/desc/raw`,
      )
      if (typeof response === 'string') {
        setRaw(response)
      } else {
        notify.toast.error(response.message)
        return
      }
    }
    setIsEditing(true)
  }

  const handleTextareaChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRaw(value)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const tid = parseTid()
    const response: string | { message: string } = await fetch.put(
      `/textures/${tid}/desc`,
      {
        content: raw,
      },
    )
    setIsSubmitting(false)
    if (typeof response === 'string') {
      setDescription(response)
      setIsEditing(false)
    } else {
      notify.toast.error(response.message)
    }
  }

  const handleCancelEdit = () => setIsEditing(false)

  const isEmptyDescription = description.trim() === ''
  if (!canEdit && isEmptyDescription) {
    return null
  }

  return (
    <div className="card">
      {canEdit && (
        <div className="p-1">
          {isEditing || (
            <a
              className="float-right btn-edit"
              href="#"
              onClick={handleEditContent}
            >
              <i className="fas fa-edit"></i>
            </a>
          )}
        </div>
      )}
      <div className="card-body">
        {isEditing ? (
          <textarea
            className="form-control"
            rows={10}
            value={raw ?? ''}
            onChange={handleTextareaChange}
          ></textarea>
        ) : isEmptyDescription ? (
          <p>
            <i>{t('texture-description.empty')}</i>
          </p>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: description }}></div>
        )}
      </div>
      {isEditing && (
        <div className="card-footer">
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-primary"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <span>
                  <i className="fas fa-sync fa-spin"></i>
                </span>
              ) : (
                t('general.submit')
              )}
            </button>
            <button
              className="btn btn-secondary"
              disabled={isSubmitting}
              onClick={handleCancelEdit}
            >
              {t('general.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

ReactDOM.render(<Description />, el)