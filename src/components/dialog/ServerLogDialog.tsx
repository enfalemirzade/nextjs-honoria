"use client";

import useSWR, { useSWRConfig } from "swr";
import { useDialogsStore } from "@/store/dialogsStore";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Log } from "@/types/models";

export default function ServerLogDialog() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { dialogs, closeDialog } = useDialogsStore()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { mutate } = useSWRConfig()
  const { code } = useParams()

  const { data: logs, isLoading: isLogsLoading } = useSWR<Log[]>(
    dialogs.serverLogDialog ? `/api/channel/${code}/main/list/log` : null
  )

  useEffect(() => {
    if (dialogs.serverLogDialog && dialogRef.current) dialogRef.current?.showModal()
  }, [dialogs.serverLogDialog])

  const handleCloseDialog = () => {
    dialogRef.current?.close()
    setTimeout(() => { closeDialog("serverLogDialog") }, 100)
  }

  const reset = async () => {
    setIsLoading(true)
    mutate(`/api/channel/${code}/main/list/log`, undefined)
    setTimeout(() => { setIsLoading(false) }, 30000)
  }

  if (!dialogs.serverLogDialog) return null

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box border-l-4 bg-base-200 border-blue-500 text-[#ebebeb]">
        <button onClick={() => handleCloseDialog()} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <div className="font-bold text-lg">Server Log</div>
        <div className="flex justify-end">
          <button disabled={isLoading} onClick={() => reset()} className="btn min-h-11 h-11 bg-base-100 hover:bg-neutral">
            <svg className="mt-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"/>
            </svg>
            Reset
          </button>
        </div>
        <div className="flex flex-col gap-8 p-2 pt-8">
          {(!logs?.length && !isLogsLoading) ?
            <div className="flex justify-center items-center gap-2 text-[#c5c5c5]">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.122 17.645a7.185 7.185 0 0 1-2.656 2.495 7.06 7.06 0 0 1-3.52.853 6.617 6.617 0 0 1-3.306-.718 6.73 6.73 0 0 1-2.54-2.266c-2.672-4.57.287-8.846.887-9.668A4.448 4.448 0 0 0 8.07 6.31 4.49 4.49 0 0 0 7.997 4c1.284.965 6.43 3.258 5.525 10.631 1.496-1.136 2.7-3.046 2.846-6.216 1.43 1.061 3.985 5.462 1.754 9.23Z"/>
              </svg>
              There is no log data
            </div>
          :
            <div className="max-h-60 h-full flex justify-center overflow-y-auto">
              {(isLogsLoading) ? <div className="flex justify-center"><span className="loading loading-spinner"></span></div> :
                <div className="w-full">
                  <div className="flex flex-col gap-5">
                    {logs?.map((server) => {
                      const createdAt = new Date(server.createdAt)
                      return (
                        <div key={server.id} className="flex justify-between items-center p-4 hover:bg-neutral bg-base-100 rounded-lg">
                          <span>{server.content}</span>
                          <span>{`${createdAt.getUTCDate()}.${createdAt.getUTCMonth() + 1}.${createdAt.getUTCFullYear().toString().slice(-2)}`}</span>
                        </div>
                      )
                    })}
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
