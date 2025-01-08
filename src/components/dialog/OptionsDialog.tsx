"use client";

import axios from "axios";
import useSWR, { useSWRConfig } from "swr";
import { useDialogsStore } from "@/store/dialogsStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState, useRef } from "react";
import { changeBioSchema } from "@/schema/schemas";
import { useForm } from "react-hook-form";
import { Profile } from "@/types/models";

export default function OptionsDialog() {
  const [error, setError] = useState<string | null>(null)
  const { dialogs, closeDialog } = useDialogsStore()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { mutate } = useSWRConfig()

  const { data: profile, isLoading: isOptionsLoading } = useSWR<Profile>(
    dialogs.optionsDialog ? "/api/user/profile/get" : null
  )

  useEffect(() => {
    if (dialogs.optionsDialog && dialogRef.current) dialogRef.current?.showModal()
  }, [dialogs.optionsDialog])

  const handleCloseDialog = () => {
    setError(null)
    reset()
    dialogRef.current?.close()
    setTimeout(() => { closeDialog("optionsDialog") }, 100)
  }

  const {
    register,
    handleSubmit,
    formState: { isSubmitting }, reset,
  } = useForm({
    resolver: yupResolver(changeBioSchema),
    mode: 'onSubmit',
  })

  const onSubmit = async (data: { bio: string }) => {
    setError(null)

    try {
      const res = await axios.post("/api/user/profile/change", data)

      if (res.status === 200) {
        mutate("/api/user/profile/get", () => { return res.data }, false)
        handleCloseDialog()
      }
    } catch (error: unknown) {
      console.error(error)
      setError("Something went wrong")
    }
  }

  if (!dialogs.optionsDialog) return null

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box border-l-4 bg-base-200 border-blue-500 text-[#ebebeb]">
        <button onClick={() => handleCloseDialog()} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <div className="font-bold text-lg">Options</div>
        <form className="flex flex-col gap-8 p-2 pt-10" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          {isOptionsLoading ? <div className="flex justify-center"><span className="loading loading-spinner"></span></div> :
          <>
            <input className="input input-bordered h-11 text-sm" type="text" placeholder={profile?.bio || "About Me"} {...register('bio')}/>
            <div className="flex justify-between items-center">
              {error ? <span className="text-xs text-red-500">{error}</span> : <span></span>}
              <button disabled={isSubmitting} className='btn min-h-11 h-11 bg-blue-700 hover:bg-blue-800 text-[#ebebeb] px-6'>
                Save
              </button>
            </div>
          </>
          }
        </form>
      </div>
    </dialog>
  )
}
