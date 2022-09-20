import { signOut } from "@astro-auth/client";
export default function Logout() {
  return (
    <>
      <button
        onClick={() => {
          signOut("/");
        }}
      >
        Log Out
      </button>
    </>
  );
}
