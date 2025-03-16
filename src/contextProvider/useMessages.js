import { useContext } from "react";
import { MessageContext } from "./ContextProvider"; // Import the context provider

export const useMessages = () => {
  return useContext(MessageContext);
};
