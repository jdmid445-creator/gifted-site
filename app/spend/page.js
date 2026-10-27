import Providers from '@/components/Providers';
import SpendApp from '@/components/SpendApp';

export const metadata = { title: 'Spend a bag' };

export default function SpendPage() {
  return (
    <Providers>
      <SpendApp />
    </Providers>
  );
}
