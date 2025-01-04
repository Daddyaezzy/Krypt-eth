import { useEffect, useState } from "react";
import { contractABI, contractAddress } from "../utils/constants";
import { ethers } from "ethers";
import PropTypes from "prop-types";
import { TransactionContext } from "./TransactionContextExport";

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });

  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      console.log(accounts);

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      } else {
        console.log("No accounts found");
      }

      getAllTransaction(accounts[0]);
    } catch (error) {
      console.log(error);

      throw new Error("no ethereum object");
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      if (!currentAccount) return alert("Please Connect your metamask wallet");

      if (!ethers.utils.isAddress(formData.addressTo)) {
        alert("Invalid Ethereum address");
        return;
      }

      const { addressTo, amount, keyword, message } = formData;

      console.log(addressTo, amount, keyword, message);
      const parsedAmount = ethers.utils.parseEther(amount);

      const transactionContract = getEthereumContract();

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208",
            value: parsedAmount._hex,
          },
        ],
      });

      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );

      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);
      await transactionHash.wait();
      setIsLoading(false);
      console.log(`Success - ${transactionHash.hash}`);

      const transactionCount = await transactionContract.getTransactionCount();

      setTransactionCount(transactionCount.toNumber());
    } catch (error) {
      console.log(error);

      throw new Error("no ethereum object");
    }
  };

  const getAllTransaction = async (sender) => {
    if (ethereum) {
      const transactionContract = getEthereumContract();

      const availableTransactions =
        await transactionContract.getAllTransactions();

      console.log("currentAccount", currentAccount);

      const allTransactions = availableTransactions.map((transaction) => ({
        addressTo: transaction.receiver,
        addressFrom: sender,
        timestamp: new Date(
          transaction.timestamp.toNumber() * 1000
        ).toLocaleString(),
        message: transaction.message,
        keyword: transaction.keyword,
        amount: parseInt(transaction.amount._hex) / 10 ** 18,
      }));

      setTransactions(allTransactions);
    } else {
      console.log("Ethereum  object ot found");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log(accounts);

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);

      throw new Error("no ethereum object");
    }
  };

  const disconnectWallet = async () => {
    try {
      setCurrentAccount(null); // Reset the current account
      console.log("Wallet disconnected");
    } catch (error) {
      console.log("Error disconnecting wallet:", error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        transactionCount,
        isLoading,
        connectWallet,
        currentAccount,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
        disconnectWallet,
        transactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

TransactionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
