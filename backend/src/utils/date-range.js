import dayjs from 'dayjs';

export function parseDateRange(dateFrom, dateTo) {
  const now = dayjs();
  const from = dateFrom ? dayjs(dateFrom) : now.subtract(30, 'day');
  const to = dateTo ? dayjs(dateTo) : now;

  if (!from.isValid() || !to.isValid()) {
    return null;
  }

  return {
    dateFrom: from.startOf('day').toDate(),
    dateTo: to.endOf('day').toDate(),
  };
}

export function getGroupByFormat(groupBy) {
  switch (groupBy) {
    case 'week': return '%Y-W%V';
    case 'month': return '%Y-%m';
    default: return '%Y-%m-%d';
  }
}

export function formatGroupLabel(dateStr, groupBy) {
  if (groupBy === 'month') {
    const parts = dateStr.split('-');
    return `${parts[0]}-${parts[1]}`;
  }
  if (groupBy === 'week') {
    return dateStr;
  }
  return dateStr;
}
