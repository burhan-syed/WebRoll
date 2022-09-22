import { signOut } from "@astro-auth/client";
export default function Logout() {
  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => {
          signOut("/");
        }}
      >
        Log Out
      </button>
    </>
  );
}
