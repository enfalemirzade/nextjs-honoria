"use client";

import axios from "axios";
import { addToList, removeFromList } from "@/utils/updateList";
import { useDialogsStore } from "@/store/dialogsStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState, useRef } from "react";
import { addServerSchema } from "@/schema/schemas";
import { sortServers } from "@/utils/listSorter";
import { useForm } from "react-hook-form";
import { Server } from "@/types/models";

export default function AddServerDialog() {
  const { dialogs, closeDialog, openDialog } = useDialogsStore()
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (dialogs.addServerDialog && dialogRef.current) dialogRef.current?.showModal()
  }, [dialogs.addServerDialog])

  const handleCloseDialog = () => {
    setError(null)
    reset()
    dialogRef.current?.close()
    setTimeout(() => { closeDialog("addServerDialog") }, 100)
  }

  const {
    register,
    handleSubmit,
    formState: { isSubmitting }, reset,
  } = useForm({
    resolver: yupResolver(addServerSchema),
    mode: 'onSubmit',
  })

  const onSubmit = async (data: { code: string }) => {
    setError(null)

    try {
      const res = await axios.post<{server: Server, noticeId: string}>("/api/user/servers/join", data)

      if (res.status === 200) {
        removeFromList("/api/user/notices/list", res.data.noticeId)
        addToList("/api/user/servers/list", res.data.server, sortServers)
        handleCloseDialog()
      }
    } catch (error: unknown) {
      console.error(error)
      setError('Something went wrong')
    }
  }

  if (!dialogs.addServerDialog) return null

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box border-l-4 border-blue-500 text-[#ebebeb] bg-base-200">
        <button onClick={() => handleCloseDialog()} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <div className="font-bold text-lg">Add Server</div>
        <div className="flex flex-col gap-8 p-2 pt-10">
          <form className="flex flex-col gap-4" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <div className="relative">
              <input className="input input-bordered w-full h-11 pr-14 text-sm" type="text" placeholder="Server Code" {...register('code')}/>
              <button disabled={isSubmitting} className="text-blue-500 hover:text-blue-600 absolute right-3 top-0 h-full">
                {isSubmitting ? <span className="loading loading-spinner loading-sm mt-1.5"></span>
                : <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 16 4-4-4-4m6 8 4-4-4-4"/>
                </svg>}
              </button>
            </div>
            {error && <span className="text-red-500 text-xs">{error}</span>}
          </form>
          <div className="flex flex-col px-6">
            <button onClick={() => openDialog('createServerDialog')} className="btn text-[#ebebeb] bg-blue-700 hover:bg-blue-800">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Zm16 14a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2ZM4 13a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6Zm16-2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6Z"/>
              </svg>
              Create New Server
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}
