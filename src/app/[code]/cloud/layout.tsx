import { FilePanel } from "@/components/panel/FilePanel"

interface Props {
  children: React.ReactNode;
}

const CloudLayout = async ({ children }: Props) => {
  return (
    <div style={{ height: "calc(100% - 80px)" }} className="flex flex-col p-4 gap-6">
      <div className="flex h-full justify-between">
        <FilePanel />
        {children}
      </div>
    </div>
  )
}

export default CloudLayout
