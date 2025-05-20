import { Layout } from '@/components/layout/layout';
import { SettingsForm } from '@/components/settings/settings-form';

export default function Settings() {
  return (
    <Layout>
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Configurações</h1>
      <SettingsForm />
    </Layout>
  );
}
