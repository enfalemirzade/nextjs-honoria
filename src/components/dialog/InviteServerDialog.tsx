"use client";

import axios from "axios";
import useSWR from "swr";
import { useDialogsStore } from "@/store/dialogsStore";
import { useEffect, useState, useRef } from "react";
import { Server } from "@/types/models";

export default function InviteServerDialog() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { data, dialogs, closeDialog } = useDialogsStore()
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const { data: servers, isLoading: isServersLoading } = useSWR<Server[]>(
    dialogs.inviteServerDialog ? "/api/user/servers/list" : null
  )

  useEffect(() => {
    if (dialogs.inviteServerDialog && dialogRef.current) dialogRef.current?.showModal()
  }, [dialogs.inviteServerDialog])

  const handleCloseDialog = () => {
    setError(null)
    dialogRef.current?.close()
    setTimeout(() => { closeDialog("inviteServerDialog") }, 100)
  }

  const onSubmit = async (data: {id: string, serverCode: string}) => {
    setIsLoading(true)
    setError(null)

    const postData = {
      id: data.id,
      serverCode: data.serverCode,
      type: "SERVER_INVITE"
    }

    try {
      const res = await axios.post("/api/user/notices/request/server", postData)

      if (res.status === 200) {
        handleCloseDialog()
      }
    } catch (error: unknown) {
      console.error(error)
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (!dialogs.inviteServerDialog) return null

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box border-l-4 bg-base-200 border-blue-500 text-[#ebebeb]">
        <button onClick={() => handleCloseDialog()} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <div className="font-bold text-lg">Invite to Server</div>
        <div className="flex flex-col gap-8 p-2 pt-10">
          <div className="max-h-60 h-full flex justify-center overflow-y-auto">
            {isServersLoading || isLoading ? <div className="flex justify-center"><span className="loading loading-spinner"></span></div> :
              !servers?.length ?
              <div className="w-full flex items-center gap-2 text-[#c5c5c5]">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.122 17.645a7.185 7.185 0 0 1-2.656 2.495 7.06 7.06 0 0 1-3.52.853 6.617 6.617 0 0 1-3.306-.718 6.73 6.73 0 0 1-2.54-2.266c-2.672-4.57.287-8.846.887-9.668A4.448 4.448 0 0 0 8.07 6.31 4.49 4.49 0 0 0 7.997 4c1.284.965 6.43 3.258 5.525 10.631 1.496-1.136 2.7-3.046 2.846-6.216 1.43 1.061 3.985 5.462 1.754 9.23Z"/>
                </svg>
                <span>First join a server</span>
              </div> 
              :
              <div className="w-full">
                <div className="flex flex-col gap-5">
                  {error && <span className="text-xs text-red-500">{error}</span>}
                  {servers?.map((serverMember) => (
                    serverMember.server.isPrivate && serverMember.role === "MEMBER" ? null : (
                      <div key={serverMember.server.id} onClick={() => onSubmit({id: data.selectedFriend.id, serverCode: serverMember.server.code})} className="flex justify-between items-center p-4 hover:bg-neutral bg-base-100 cursor-pointer rounded-lg">
                        <span>{serverMember.server.name}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </dialog>
  )
}
