import { sortFriends } from "@/utils/listSorter";
import { editList } from "@/utils/updateList";

interface WatchlistEvent {
  user_ids: string[]
  name: string
}

export async function watchlistHandler(event: WatchlistEvent): Promise<void> {  
  const status = event.name === "online" ? true : false

  for(const id of event.user_ids) {
    editList("/api/user/friends/list", {id: id, isOnline: status}, sortFriends)
  }
}
