import React, { useEffect, useState } from "react";
import { useWalletSelector } from "../utils/walletSelector";

function Home() {
  const { selector, modal, accountId, logged } = useWalletSelector();
  const [signIn, setSignIn] = useState(false)
  const [nearAccount, setNearAccount] = useState(accountId)
  useEffect(() => {
    if (signIn) {
      console.log("Se inicio sesion");
      setNearAccount(accountId)
      //window.location.reload();
    }
  }, [accountId]);
  const handleSignIn = () => {
    modal.show();
    setSignIn(true);
  };
  const handleLogOut = async () => {
    const wallet = await selector.wallet();
    wallet.signOut().catch((err) => {
        console.log("Failed to sign out");
        console.error(err);
      }).then((res) => {
        window.location.href = "/"
      })
  }
  return (
    <div>
      <h1 className="text-3xl font-bold underline">This is the home page {nearAccount}</h1>
      {logged ? <button onClick={handleLogOut} className="text-3xl font-bold underline">Log Out</button> : <button onClick={handleSignIn} className="text-3xl font-bold underline">Log In</button>}
    </div>
  );
}

export default Home;
