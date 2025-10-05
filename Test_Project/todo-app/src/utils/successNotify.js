import notify from './notify'

export default function successNotify(message = 'تسک با موفقیت اضافه شد') {
  return notify(message, 'success', { backdrop: true })
}
