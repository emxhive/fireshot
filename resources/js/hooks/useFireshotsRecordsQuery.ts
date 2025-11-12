import { useQuery } from '@tanstack/react-query';
import { getRecords } from '@/lib/api';

export function useFireshotsRecordsQuery() {
  return useQuery({
    queryKey: ['records'],
    queryFn: async () => {
      const res: any = await getRecords();
      if (res.status !== 'success') throw new Error(res.message);
      return res.data;
    },
  });
}
