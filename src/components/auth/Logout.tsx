import { signOut } from "@astro-auth/client";
const Logout = () => {
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
  )
}

export default Logout