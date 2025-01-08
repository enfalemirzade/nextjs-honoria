"use client";

import axios from "axios";
import { useDialogsStore } from "@/store/dialogsStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState, useRef } from "react";
import { addFolderSchema } from "@/schema/schemas";
import { addToList } from "@/utils/updateList";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";

export default function CreateFolderDialog() {
  const [error, setError] = useState<string | null>(null)
  const { dialogs, closeDialog } = useDialogsStore()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { code } = useParams()

  useEffect(() => {
    if (dialogs.createFolderDialog && dialogRef.current) dialogRef.current?.showModal()
  }, [dialogs.createFolderDialog])

  const handleCloseDialog = () => {
    setError(null)
    reset()
    dialogRef.current?.close()
    setTimeout(() => { closeDialog("createFolderDialog") }, 100)
  }

  const {
    register,
    handleSubmit,
    formState: { isSubmitting }, reset,
  } = useForm({
    resolver: yupResolver(addFolderSchema),
    mode: 'onSubmit',
  })

    const onSubmit = async (data: { name: string }) => {
      setError(null)
  
      const postData = {
        name: data.name,
        code
      }
  
      try {
        const res = await axios.post(`/api/channel/${code}/cloud/folder/add`, postData)
  
        if (res.status === 200) {
          addToList(`/api/channel/${code}/cloud/folder/list`, res.data)
          handleCloseDialog()
        }
      } catch (error: unknown) {
        console.error(error)
        setError("Something went wrong")
      }
    }

  if (!dialogs.createFolderDialog) return null

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box border-l-4 border-blue-500 text-[#ebebeb] bg-base-200">
        <button onClick={() => handleCloseDialog()} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <div className='text-lg font-bold'>Create Folder</div>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className='flex flex-col gap-8 p-2 pt-10'>
          <input {...register('name')} className="input input-bordered text-sm h-11" type="text" placeholder="Folder Name"/>
          <div className='flex justify-between items-center'>
            {error ? <span className="text-xs text-red-500">{error}</span> : <span></span>}
            <button disabled={isSubmitting} className='btn min-h-11 h-11 bg-blue-700 hover:bg-blue-800 text-[#ebebeb] px-6'>Save</button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
