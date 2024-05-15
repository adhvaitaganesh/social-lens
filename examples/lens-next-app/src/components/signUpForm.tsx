import { useCreateProfile } from "@lens-protocol/react-web";

import { ErrorMessage } from "./ErrorMessage";
import { Loading } from "./Loading";
import { Button } from "./Button";

//sign up form
export function SignUpForm({ owner, onSuccess }: {owner: string; onSuccess?: () => void }) {
  const { execute: createProfile, loading: isCreateProfilePending, error: errors } = useCreateProfile();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const handle = formData.get("handle") as string;

    const result = await createProfile({
      localName : handle,
      to: owner
    });

    if (result.isSuccess()) {
      console.info(`Profile created with ID: ${result.value}`);
      return onSuccess?.();
    }

    console.error(result.error.message);
  };

  return (
    <form onSubmit={onSubmit} className="flex">
      <fieldset className="flex place-items-center flex-col">
        <legend className="text-base text-gray-500">Create a Lens Profile.</legend>

        <div className="my-4 space-y-2">
          <label className="w-full">
            <span className="text-sm text-gray-500">Handle</span>
            <input
              disabled={isCreateProfilePending}
              type="text"
              name="handle"
              className="w-full p-4 rounded-lg border transition-colors border-gray-300 hover:border-gray-500 text-black"
              required
            />
          </label>
        </div>

        <Button type="submit" disabled={isCreateProfilePending}>
          Create Profile
        </Button>
      </fieldset>
    </form>
  );
}