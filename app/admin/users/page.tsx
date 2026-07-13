import { UsersClient } from "@/components/admin/users-client";
import { getUsersData } from "@/lib/admin/get-users-data";

export default async function UsersPage() {
  const users = await getUsersData();

  return <UsersClient initialUsers={users} />;
}
