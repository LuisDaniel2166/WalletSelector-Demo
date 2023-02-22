import React, { useEffect, useState } from "react";
import { useWalletSelector } from "../utils/walletSelector";
import { providers, utils } from "near-api-js";

function Home() {
  const { selector, modal, accountId, logged } = useWalletSelector();
  const [signIn, setSignIn] = useState(false);
  const [nearAccount, setNearAccount] = useState(accountId);
  const [text, setText] = useState("");
  const [trigger, setTrigger] = useState(false);
  const [messages, setMessages] = useState({
    items: [],
  });
  //Dato del gas -> se convirtio de NEAR's a YOCTO
  const GAS = utils.format.parseNearAmount("0.00000000003");

  //useEffect para el control del inicio de sesion
  useEffect(() => {
    if (signIn) {
      console.log("Se inicio sesion");
      setNearAccount(accountId);
    }
  }, [accountId]);

  //useEffect para poder recuperar los ultimos mensajes en el contrato
  useEffect(() => {
    async function getData() {
      const { network } = selector.options;
      const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
      const data = await provider.query({
        request_type: "call_function",
        account_id: "guest-book.testnet",
        method_name: "getMessages",
        args_base64: "",
        finality: "optimistic",
      });
      let messages = JSON.parse(Buffer.from(data.result).toString());
      setMessages({
        ...messages,
        items: messages.reverse(),
      });
    }
    getData();
  }, [trigger]);

  //Funcion con la cual el usuario podra inicializar wallet selector
  const handleSignIn = () => {
    modal.show();
    setSignIn(true);
  };

  // En esta funcion se realiza el proceso de wallet selector para poder cerrar la sesion y eliminar la informacion del usuario
  const handleLogOut = async () => {
    const wallet = await selector.wallet();
    wallet
      .signOut()
      .catch((err) => {
        console.log("Failed to sign out");
        console.error(err);
      })
      .then((res) => {
        window.location.href = "/";
      });
  };

  //Actualizacion de la informacion en el campo del mensaje
  const handleChangeText = (e) => {
    setText(e.target.value);
  };

  //Funcion para poder ejecutar una transaccion a la blockchain de near
  const sendMessage = async () => {
    const wallet = await selector.wallet();
    await wallet
      .signAndSendTransaction({
        signerId: accountId,
        receiverId: "guest-book.testnet",
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "addMessage",
              args: { text: text },
              gas: GAS,
              deposit: 0.01,
            },
          },
        ],
      })
      .then(() => {
        setText("");
        setTrigger(!trigger);
      });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold underline pb-4">
        Wallet selector demo
      </h1>
      {/* Si esta iniciada la sesion muestra la account en la cual se encuentra iniciada la sesion */}
      <h2 className="text-2xl font-bold pb-2">
        {logged ? "Bienvenido " + nearAccount : ""}
      </h2>
      {/* Esta seccion de codigo se muestra el inicio de sesion con wallet selector, dependiendo del estado de la sesion muestra uno u otro */}
      {logged ? (
        <button
          onClick={handleLogOut}
          className="text-xl text-white font-bold bg-red-700 rounded-xl px-4 py-2 border-2 border-black hover:bg-red-900"
        >
          Cerrar sesión
        </button>
      ) : (
        <button
          onClick={handleSignIn}
          className="text-xl text-white font-bold bg-green-700 rounded-xl px-4 py-2 border-2 border-black hover:bg-green-900"
        >
          Iniciar sesion
        </button>
      )}
      {/* Si el usuario tiene su sesion iniciada se muestra la seccion para poder realizar el envio de un mensaje a el contrato */}
      {logged ? (
        <div className="flex justify-center pt-4 w-full">
          <input className="w-1/3 bg-slate-400 border-2 border-black rounded-md mr-4" name="text" value={text} onChange={handleChangeText}></input>
          <button onClick={sendMessage} className="border-2 border-black bg-yellow-600 text-bold text-white font-bold p-2 rounded-xl">Enviar mensaje</button>
        </div>
      ) : (
        ""
      )}
      {/* Seccion donde se muestra toda la informacion recuperada desde el contrato en una tabla */}
      <div className="flex pt-4 w-full px-6 justify-center flex-col">
        <p className="text-2xl font-bold pb-4">Ultimos mensajes:</p>
        <table className="table-fixed w-full text-gray-100">
          <thead className="bg-gray-600">
            <tr>
              <th>Usuario</th>
              <th>Mensaje</th>
            </tr>
          </thead>
          <tbody>
            {messages.items.map((data, key) => {
              return (
                <>
                  <tr className="bg-gray-400">
                    <td className="border-2">{data.sender}</td>
                    <td className="border-2">{data.text}</td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;
