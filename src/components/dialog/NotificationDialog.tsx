"use client";

import axios from "axios";
import useSWR from "swr";
import { addToList, removeFromList } from "@/utils/updateList";
import { sortServers, sortFriends } from "@/utils/listSorter";
import { Notice, Friend, Server } from "@/types/models";
import { useDialogsStore } from "@/store/dialogsStore";
import { useEffect, useState, useRef } from "react";
import { pusher } from "@/lib/pusher";

export default function NotificationDialog() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { dialogs, closeDialog } = useDialogsStore()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const { data: notices, isLoading: isNoticesLoading } = useSWR<Notice[]>(
    dialogs.notificationDialog ? "/api/user/notices/list" : null
  )

  useEffect(() => {
    if (dialogs.notificationDialog && dialogRef.current) dialogRef.current?.showModal()
  }, [dialogs.notificationDialog])

  const handleCloseDialog = () => {
    setError(null)
    dialogRef.current?.close()
    setTimeout(() => { closeDialog("notificationDialog") }, 100)
  }

  const onSubmit = async (data: {noticeId: string, id: string, type:string, answer: boolean, serverCode?: string}) => {
    setIsLoading(true)
    setError(null)

    try {
      if(data.type === "SERVER_INVITE") {
        const res = await axios.post<Server>("/api/user/notices/answer/server", data)

        if(res.status === 200 && data.answer) {
          addToList("/api/user/servers/list", res.data, sortServers)
        }
      }
      else if(data.type === "FRIEND_REQUEST") {
        const res = await axios.post<Friend>("/api/user/notices/answer/friend", data)

        if(res.status === 200 && data.answer) {
          addToList("/api/user/friends/list", res.data, sortFriends)
          pusher.disconnect()
        }
      }
  
      removeFromList("/api/user/notices/list", data.noticeId)
    } catch (error: unknown) {
      console.error(error)
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (!dialogs.notificationDialog) return null

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box border-l-4 bg-base-200 border-blue-500 text-[#ebebeb]">
        <button onClick={() => handleCloseDialog()} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <div className="font-bold text-lg">Notifications</div>
        <div className="flex flex-col gap-8 p-2 pt-10">
          <div className="max-h-60 flex flex-col gap-3 overflow-y-auto">
            {error && <span className="text-xs text-red-500">{error}</span>}
            {isNoticesLoading || isLoading ? <div className="flex justify-center"><span className="loading loading-spinner"></span></div> :
            !notices?.length ?
              <div className="flex items-center gap-2 text-[#c5c5c5]">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.122 17.645a7.185 7.185 0 0 1-2.656 2.495 7.06 7.06 0 0 1-3.52.853 6.617 6.617 0 0 1-3.306-.718 6.73 6.73 0 0 1-2.54-2.266c-2.672-4.57.287-8.846.887-9.668A4.448 4.448 0 0 0 8.07 6.31 4.49 4.49 0 0 0 7.997 4c1.284.965 6.43 3.258 5.525 10.631 1.496-1.136 2.7-3.046 2.846-6.216 1.43 1.061 3.985 5.462 1.754 9.23Z"/>
                </svg>
                <span>No notification</span>
              </div> :
              notices.map((notice) => (
                <div key={notice.id} className="flex justify-between items-center bg-base-100 hover:bg-neutral p-3 rounded-lg">
                  <div className="flex flex-col gap-2">
                    <div className="text-sm">{notice.sender.name}</div>
                    <div className="text-xs text-[#c5c5c5]">{notice.type === "SERVER_INVITE" ? `#${notice.serverCode}` : "Friend Request"}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onSubmit({noticeId: notice.id, id: notice.senderId, type: notice.type, answer: true, serverCode: notice.serverCode || undefined})} className="p-1 hover:bg-blue-700 rounded-btn">
                      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5"/>
                      </svg>
                    </button>
                    <button onClick={() => onSubmit({noticeId: notice.id, id: notice.senderId, type: notice.type, answer: false, serverCode: notice.serverCode || undefined})} className="p-1 hover:bg-rose-700 rounded-btn">
                      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </dialog>
  )
}
