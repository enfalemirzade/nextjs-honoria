"use client";

import axios from "axios";
import { useDialogsStore } from "@/store/dialogsStore";
import { useEffect, useState, useRef } from "react";
import { removeFromList } from "@/utils/updateList";

export default function FriendDialog() {
  const { data, dialogs, closeDialog, openDialog } = useDialogsStore()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (dialogs.friendDialog && dialogRef.current) dialogRef.current?.showModal()
  }, [dialogs.friendDialog])

  const handleCloseDialog = () => {
    setError(null)
    dialogRef.current?.close()
    setTimeout(() => { closeDialog("friendDialog") }, 100)
  }

  const onSubmit = async (data: {id: string}) => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await axios.post("/api/user/friends/remove", data)

      if (res.status === 200) {
        removeFromList("/api/user/friends/list", data.id)
        handleCloseDialog()
      }
    } catch (error: unknown) {
      console.error(error)
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (!dialogs.friendDialog) return null

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box border-l-4 border-blue-500 text-[#ebebeb] bg-base-200">
        <button onClick={() => handleCloseDialog()} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <div className="font-bold text-lg truncate max-w-[400px]">{data.selectedFriend.name} <div className="text-xs text-[#c5c5c5]">{data.selectedFriend.isOnline ? "online" : "offline"}</div></div>
        <div className="flex flex-col gap-8 p-2 pt-9">
          <div className="bg-neutral p-4 py-3 rounded-lg">
            <div className="max-w-full truncate text-sm">{data.selectedFriend.bio || "About me"}</div>
          </div>
          {error && <span className="text-xs text-red-500">{error}</span>}
          <div className="flex flex-col justify-center gap-4 px-6 md:flex-row">
            <button onClick={() => openDialog('inviteServerDialog')} className='btn min-h-11 h-11 text-[#ebebeb] bg-blue-700 hover:bg-blue-800'>
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.248 19C3.22 15.77 5.275 8.232 12.466 8.232V6.079a1.025 1.025 0 0 1 1.644-.862l5.479 4.307a1.108 1.108 0 0 1 0 1.723l-5.48 4.307a1.026 1.026 0 0 1-1.643-.861v-2.154C5.275 13.616 4.248 19 4.248 19Z"/>
              </svg>
              Invite Server
            </button>
            <button disabled={isLoading} onClick={() => onSubmit({id: data.selectedFriend.id}) } className='btn min-h-11 h-11 text-[#ebebeb] bg-rose-700 hover:bg-rose-800'>
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14"/>
              </svg>
              Remove Frend
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}
