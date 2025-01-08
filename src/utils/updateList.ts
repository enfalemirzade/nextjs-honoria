import { mutate } from "swr";

export function addToList<Type>(key: string, update: Type, sorter?: ((Type: Type[]) => Type[])) {
  if(!sorter) sorter = ((Type: Type[]) => {return Type})

  mutate(key, (currentData: Type[] | undefined) => {
    return currentData ? sorter([update, ...currentData]) : [update]
  }, false)
}

export function editList<Type extends { id: string }>(key:string, update: Partial<Type>, sorter?: ((Type: Type[]) => Type[])) {
  mutate(key, (currentData: Type[] | undefined) => {
    if (!currentData) return
    let updated = currentData.map((item) => {
      if(item.id === update.id) {
        for (const prop in update) {
          if (Object.prototype.hasOwnProperty.call(update, prop)) {
            if (item[prop] !== update[prop]) {
              item = { ...item, [prop]: update[prop] }
            }
          }
        }
      }
      return item
    })

    if(sorter) updated = sorter(updated)
    return updated
  }, false)
}

export function removeFromList<Type extends { id: string }>(key: string, update: string) {
  mutate(key, (currentData: Type[] | undefined) => {
    return currentData ? currentData.filter((data) => data.id !== update) : []
  }, false)
}
