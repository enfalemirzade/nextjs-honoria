"use client";

import useSWR, { useSWRConfig } from "swr";
import axios from "axios";
import { useDialogsStore } from "@/store/dialogsStore";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Folder } from "@/types/models";

export default function UploadFileDialog() {
  const [selectedFolder, setFolder] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { dialogs, closeDialog } = useDialogsStore()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { code }: { code:string } = useParams()
  const { mutate } = useSWRConfig()

  const { data: folders, isLoading: isFoldersLoading } = useSWR<Folder[]>(
    dialogs.uploadFileDialog ? `/api/channel/${code}/cloud/folder/list` : null
  )

  useEffect(() => {
    if (dialogs.uploadFileDialog && dialogRef.current) dialogRef.current?.showModal()
  }, [dialogs.uploadFileDialog])

  const handleCloseDialog = () => {
    setFolder(null)
    setError(null)
    if(fileInputRef.current) fileInputRef.current.value = ""
    dialogRef.current?.close()
    setTimeout(() => { closeDialog("uploadFileDialog") }, 100)
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      handleFileUpload(null, e.dataTransfer.files);
    }
  }

  const handleFileUpload = async (event?: React.ChangeEvent<HTMLInputElement> | null, fileList?: FileList) => {
    let files;

    if(event) {
      files = event.target.files 
    }

    if(fileList) {
      files = fileList
    }

    if (!files || !files.length || !selectedFolder) {
      setError('Something went wrong')
      if(fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => formData.append("files", file))
      formData.append("folderId", selectedFolder)
      formData.append("code", code)

      const res = await axios.post(`/api/channel/${code}/cloud/file/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if(res.status === 200) {
        handleCloseDialog()
        mutate(`/api/channel/${code}/cloud/folder/list`, undefined)
      }
    } catch(err) {
      setError('Something went wrong')
      if(fileInputRef.current) fileInputRef.current.value = ""

      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!dialogs.uploadFileDialog) return null

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box border-l-4 bg-base-200 border-blue-500 text-[#ebebeb]">
        <button onClick={() => handleCloseDialog()} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <div className="font-bold text-lg">Upload File</div>
        <div className="flex flex-col gap-8 p-2 pt-8">
          {(!folders?.length && !isFoldersLoading) ?
            <div className="flex justify-center items-center gap-2 text-[#c5c5c5]">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.122 17.645a7.185 7.185 0 0 1-2.656 2.495 7.06 7.06 0 0 1-3.52.853 6.617 6.617 0 0 1-3.306-.718 6.73 6.73 0 0 1-2.54-2.266c-2.672-4.57.287-8.846.887-9.668A4.448 4.448 0 0 0 8.07 6.31 4.49 4.49 0 0 0 7.997 4c1.284.965 6.43 3.258 5.525 10.631 1.496-1.136 2.7-3.046 2.846-6.216 1.43 1.061 3.985 5.462 1.754 9.23Z"/>
              </svg>
              First create a folder
            </div>
          :<>
            {(isFoldersLoading || isLoading) ? <div className="flex justify-center"><span className="loading loading-spinner"></span></div> :
              <div className="flex flex-col gap-3">
                <div className="text-sm">Select a folder</div>
                <div className="max-h-32 h-full flex justify-center overflow-y-auto">
                  <div className="w-full">
                    <div className="flex flex-col gap-5 cursor-pointer">
                      {folders?.map((folder) => (
                        <div key={folder.id} onClick={() => setFolder(folder.id)} className={`flex justify-between items-center p-4 hover:bg-neutral rounded-lg ${selectedFolder === folder.id ? "bg-neutral cursor-default" : "bg-base-100"}`}>
                          <span>{folder.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            }
            {error && <span className="text-xs text-red-500">{error}</span>}
            <div onClick={handleFileSelect} onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`flex flex-col justify-center items-center gap-4 py-6 cursor-pointer bg-base-100 rounded-lg hover:bg-neutral ${isLoading && "opacity-60 !cursor-default"}`}>
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9V4a1 1 0 0 0-1-1H8.914a1 1 0 0 0-.707.293L4.293 7.207A1 1 0 0 0 4 7.914V20a1 1 0 0 0 1 1h4M9 3v4a1 1 0 0 1-1 1H4m11 6v4m-2-2h4m3 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"/>
              </svg>
              <div>Select a file</div>
            </div>
            <input disabled={isLoading} ref={fileInputRef} type="file" multiple hidden onChange={handleFileUpload} />
            </>
          }
        </div>
      </div>
    </dialog>
  )
}
