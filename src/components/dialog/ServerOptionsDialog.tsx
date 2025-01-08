"use client";

import axios from "axios";
import { useDialogsStore } from "@/store/dialogsStore";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

export default function ServerOptionsDialog() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isDelete, setIsDelete] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { dialogs, closeDialog } = useDialogsStore()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { code } = useParams()

  useEffect(() => {
    if (dialogs.serverOptionsDialog && dialogRef.current) setTimeout(() => {
      setIsDelete(false)
      dialogRef.current?.showModal()
    }, 100)
  }, [dialogs.serverOptionsDialog])

  const handleCloseDialog = () => {
    setError(null)
    dialogRef.current?.close()
    setTimeout(() => { closeDialog("serverOptionsDialog") }, 100)
  }

  const onSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await axios.post(`/api/channel/${code}/main/delete`, {code: code})

      if (res.status === 200) {
        handleCloseDialog()
      }
    } catch (error: unknown) {
      console.error(error)
      setError('Something went wrong')
    }
    finally {
      setIsLoading(false)
    }
  }

  if (!dialogs.serverOptionsDialog) return null

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box border-l-4 border-blue-500 text-[#ebebeb] bg-base-200">
        <button onClick={() => handleCloseDialog()} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <div className='text-lg font-bold'>Server Options</div>
        {isDelete ?
          <div className="flex flex-col gap-8 p-2 pt-10">
            {error ? <span className="text-xs text-red-500">{error}</span> : ""}
            <div className="flex items-center gap-2">
              <svg className="mt-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
              </svg>
              <div>Are you sure? This process cannot be reversed.</div>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={() => { setIsDelete(false) }} className="btn min-h-11 h-11 px-2.5 bg-base-100 hover:bg-neutral text-[#ebebeb]">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7"/>
                </svg>
              </button>
              <button onClick={() => onSubmit()} disabled={isLoading} className='btn min-h-11 h-11 bg-rose-700 hover:bg-rose-800 text-[#ebebeb] px-6'>
                Confirm Delete
              </button>
            </div>
          </div>
        : 
          <div className='flex flex-col gap-8 p-2 pt-10'>
            <div className="flex text-sm justify-between items-center">
              <span>Delete this server permanently</span>
              <button onClick={() => setIsDelete(true)} className='btn min-h-11 h-11 bg-rose-700 hover:bg-rose-800 text-[#ebebeb] px-6'>
                Delete
              </button>
            </div>
          </div>
        }
      </div>
    </dialog>
  )
}
