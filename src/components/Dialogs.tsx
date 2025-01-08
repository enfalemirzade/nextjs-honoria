import ServerOptionsDialog from "@/components/dialog/ServerOptionsDialog";
import CreateFolderDialog from "@/components/dialog/CreateFolderDialog";
import CreateServerDialog from "@/components/dialog/CreateServerDialog";
import InviteServerDialog from "@/components/dialog/InviteServerDialog";
import NotificationDialog from "@/components/dialog/NotificationDialog";
import UploadFileDialog from "@/components/dialog/UploadFileDialog";
import ServerLogDialog from "@/components/dialog/ServerLogDialog";
import AddFriendDialog from "@/components/dialog/AddFriendDialog";
import AddServerDialog from "@/components/dialog/AddServerDialog";
import OptionsDialog from "@/components/dialog/OptionsDialog";
import BanListDialog from "@/components/dialog/BanListDialog";
import FriendDialog from "@/components/dialog/FriendDialog";
import UserDialog from "@/components/dialog/UserDialog";

export function Dialogs() {
  return (
    <>
      <ServerOptionsDialog />
      <CreateFolderDialog />
      <CreateServerDialog />
      <InviteServerDialog />
      <NotificationDialog />
      <UploadFileDialog />
      <ServerLogDialog />
      <AddFriendDialog />
      <AddServerDialog />
      <OptionsDialog />
      <BanListDialog />
      <FriendDialog />
      <UserDialog />
    </>
  )
}
