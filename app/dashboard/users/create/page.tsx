import { UserForm } from "../../components/user-form";

export default function CreateUserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Create user</h1>
        <p className="text-muted-foreground mt-1">Add a new user to the system</p>
      </div>
      <UserForm />
    </div>
  );
}
