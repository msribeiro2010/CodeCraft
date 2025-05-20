import { Layout } from '@/components/layout/layout';
import { ReminderList } from '@/components/reminders/reminder-list';

export default function Reminders() {
  return (
    <Layout>
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Lembretes</h1>
      <ReminderList />
    </Layout>
  );
}
