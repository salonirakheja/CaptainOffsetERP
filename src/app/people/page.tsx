import { getAllPeople } from '@/lib/db/people';
import PeoplePageClient from './PeoplePageClient';

export const dynamic = 'force-dynamic';

export default async function PeoplePage() {
  const people = await getAllPeople();
  return <PeoplePageClient people={people} />;
}
