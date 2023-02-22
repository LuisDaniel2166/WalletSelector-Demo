import React, { useCallback, useContext, useEffect, useState } from "react";
import { map, distinctUntilChanged } from "rxjs";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";

//Creamos el context de wallet selextor
const WalletSelectorContext = React.createContext(null);

export const WalletSelectorContextProvider = ({ children }) => {
    //Realizamos los state que almacenaran la informacion de wallet selector, modal y accounts
    const [selector, setSelector] = useState(null);
    const [modal, setModal] = useState(null);
    const [accounts, setAccounts] = useState([]);
    //Realizamos la inicializacion de wallet selector
    //Aqui se declara la red y las wallets que podramos usar dentro de wallet selector
    const init = useCallback(async () => {
        const _selector = await setupWalletSelector({
            network: "testnet",
            debug: true,
            modules: [
                setupNearWallet(),
                setupMyNearWallet(),
                setupMeteorWallet(),
                setupNightly(),
            ],
        });
        //Se realiza la declaracion del modal de wallet selector junto al contrato donde se iniciara sesion
        const _modal = setupModal(_selector, { contractId: "guest-book.testnet" });
        const state = _selector.store.getState();
        //Se realizan las asignaciones a las variables de accounts, selector, modal
        setAccounts(state.accounts);
        window.selector = _selector;
        window.modal = _modal;
        setSelector(_selector);
        setModal(_modal);
    }, []);
    useEffect(() => {
        init().catch((err) => {
            console.error(err);
            alert("Failed to initialise wallet selector");
        });
    }, [init]);
    //Declaramos el useEffect el cual iniciar la pagina se realizara la carga de wallet selector
    useEffect(() => {
        if (!selector) {
            return;
        }
        const subscription = selector.store.observable
            .pipe(map((state) => state.accounts), distinctUntilChanged())
            .subscribe((nextAccounts) => {
            console.log("Accounts Update", nextAccounts);
            setAccounts(nextAccounts);
        });
        return () => subscription.unsubscribe();
    }, [selector]);
    if (!selector || !modal) {
        return null;
    }
    //Se declaran las variables de accountId y logged las cuales nos permiten poder obtener la cuenta activa y si tenemos la sesion iniciada
    const accountId = accounts.find((account) => account.active)?.accountId || null;
    const logged = accounts.find((account) => account.active)?.active || false;
    //Se retorna el context de wallet selector junto a las variables que podemos utilizar para poder trabajar con la red de NEAR
    return (<WalletSelectorContext.Provider value={{
            selector,
            modal,
            accounts,
            accountId,
            logged,
        }}>
      {children}
    </WalletSelectorContext.Provider>);
};
//Se declara la funcion la cual podremos llamar dentro de los archivos de nuestro proyecto para hacer uso de wallet selector
export function useWalletSelector() {
    const context = useContext(WalletSelectorContext);
    if (!context) {
        throw new Error("useWalletSelector must be used within a WalletSelectorContextProvider");
    }
    return context;
}