import dayjs from 'dayjs';

export function addDuration(value, duration) {
  return dayjs().add(value, duration).toDate();
}
