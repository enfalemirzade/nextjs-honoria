"use client";

import axios from "axios";
import { useDialogsStore } from "@/store/dialogsStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { createServerSchema } from "@/schema/schemas";
import { useEffect, useState, useRef } from "react";
import { sortServers } from "@/utils/listSorter";
import { addToList } from "@/utils/updateList";
import { useForm } from "react-hook-form";
import { Server } from "@/types/models";

export default function CreateServerDialog() {
  const [error, setError] = useState<string | null>(null)
  const { dialogs, closeDialog } = useDialogsStore()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (dialogs.createServerDialog && dialogRef.current) dialogRef.current?.showModal()
  }, [dialogs.createServerDialog])

  const handleCloseDialog = () => {
    setError(null)
    reset()
    dialogRef.current?.close()
    setTimeout(() => { closeDialog("createServerDialog") }, 100)
  }

  const {
    register,
    handleSubmit,
    formState: { isSubmitting }, reset,
  } = useForm({
    resolver: yupResolver(createServerSchema),
    mode: 'onSubmit',
  })

  const onSubmit = async (data: { name: string; isPrivate: boolean }) => {
    setError(null)

    try {
      const res = await axios.post<Server>("/api/user/servers/create", data)

      if (res.status === 200) {
        addToList("/api/user/servers/list", res.data, sortServers)
        handleCloseDialog()
      }
    } catch (error: unknown) {
      console.error(error)
      setError('Something went wrong')
    }
  }

  if (!dialogs.createServerDialog) return null

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box border-l-4 bg-base-200 border-blue-500 text-[#ebebeb]">
        <button onClick={() => handleCloseDialog()} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <div className="font-bold text-lg">Create Server</div>
        <form className="flex flex-col gap-8 p-2 pt-10" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <input className="input input-bordered h-11 text-sm" type="text" placeholder="Server Name" {...register('name')}/>
            <div className="flex items-center gap-4">
              <div className="text-sm">Private Server</div>
              <input type="checkbox" className="toggle mt-1 checked:border-blue-500 checked:bg-blue-500" {...register('isPrivate')}/>
            </div>
          </div>
          <div className="flex justify-between items-center">
            {error ? <span className="text-red-500 text-xs">{error}</span> : <span></span>}
            <button disabled={isSubmitting} className="btn min-h-11 h-11 px-6 bg-blue-700 hover:bg-blue-800 text-[#ebebeb]">Create</button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
