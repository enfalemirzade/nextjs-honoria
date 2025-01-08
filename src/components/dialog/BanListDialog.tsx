"use client";

import useSWR, { useSWRConfig } from "swr";
import axios from "axios";
import { useDialogsStore } from "@/store/dialogsStore";
import { removeFromList } from "@/utils/updateList";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { User } from "@/types/models";

export default function BanListDialog() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { dialogs, closeDialog } = useDialogsStore()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { mutate } = useSWRConfig()
  const { code } = useParams()

  const { data: bans, isLoading: isBansLoading } = useSWR<User[]>(
    dialogs.banListDialog ? `/api/channel/${code}/main/list/ban` : null
  )

  useEffect(() => {
    if (dialogs.banListDialog && dialogRef.current) dialogRef.current?.showModal()
  }, [dialogs.banListDialog])

  const handleCloseDialog = () => {
    setError(null)
    dialogRef.current?.close()
    setTimeout(() => { closeDialog("banListDialog") }, 100)
  }

  const onSubmit = async (data: {id: string}) => {
    setIsLoading(true)
    setError(null)

    const postData = {
      id: data.id,
      code: code
    }

    try {
      const res = await axios.post(`/api/channel/${code}/users/manage/ban`, postData)
      if(res.status === 200) {
        removeFromList(`/api/channel/${code}/main/list/ban`, data.id)
      }
    } catch (err) {
      setError("Something went wrong")
      console.log(err)
    } 
    finally {
      setIsLoading(false)
    }
  }

  const reset = async () => {
    setIsLoading(true)
    mutate(`/api/channel/${code}/main/list/ban`, undefined)
    setTimeout(() => { setIsLoading(false) }, 30000)
  }

  if (!dialogs.banListDialog) return null

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box border-l-4 bg-base-200 border-blue-500 text-[#ebebeb]">
        <button onClick={() => handleCloseDialog()} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <div className="font-bold text-lg">Ban List</div>
        <div className="flex justify-end">
          <button disabled={isLoading} onClick={() => reset()} className="btn min-h-11 h-11 bg-base-100 hover:bg-neutral">
            <svg className="mt-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"/>
            </svg>
            Reset
          </button>
        </div>
        <div className="flex flex-col gap-8 p-2 pt-8">
          {(!bans?.length && !isBansLoading) ?
            <div className="flex justify-center items-center gap-2 text-[#c5c5c5]">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.122 17.645a7.185 7.185 0 0 1-2.656 2.495 7.06 7.06 0 0 1-3.52.853 6.617 6.617 0 0 1-3.306-.718 6.73 6.73 0 0 1-2.54-2.266c-2.672-4.57.287-8.846.887-9.668A4.448 4.448 0 0 0 8.07 6.31 4.49 4.49 0 0 0 7.997 4c1.284.965 6.43 3.258 5.525 10.631 1.496-1.136 2.7-3.046 2.846-6.216 1.43 1.061 3.985 5.462 1.754 9.23Z"/>
              </svg>
              There is no banned user
            </div>
          :
            <div className="max-h-60 h-full flex justify-center overflow-y-auto">
              {isBansLoading ? <div className="flex justify-center"><span className="loading loading-spinner"></span></div> :
                <div className="w-full">
                  <div className="flex flex-col gap-5">
                    {error && <span className="text-xs text-red-500">{error}</span>}
                    {bans?.map((banned) => (
                      <div key={banned.id} className="flex text-sm justify-between items-center p-4 hover:bg-neutral bg-base-100 rounded-lg">
                        <span>{banned.name}</span>
                        <button onClick={() => onSubmit({id: banned.id})} disabled={isLoading} className="p-1 hover:bg-rose-700 rounded-btn">
                          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </dialog>
  )
}
