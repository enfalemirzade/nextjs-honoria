import ChannelMain from "@/components/ChannelMain"

export default function ChannelPage() {
  return(
    <div style={{ height: "calc(100% - 80px)" }} className="flex flex-col p-4 gap-6">
      <div className="flex h-full items-start justify-center">
        <ChannelMain />
      </div>
    </div>
  )
}
