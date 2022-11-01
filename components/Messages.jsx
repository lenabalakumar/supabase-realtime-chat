import React from "react";
import styles from "../styles/Home.module.css";
import { supabaseClient } from "../utils/supabaseClient";

const Messages = () => {
  const [messages, setMessages] = React.useState([]);

  React.useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabaseClient.from("messages").select("*");

      if (!error) {
        setMessages(data);
      }
    };
    fetchMessages();
  }, []);

  React.useEffect(() => {
    const newMessagesChannel = supabaseClient
      .channel("messages-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          console.log("Receiving payload");
          console.log(payload);
          setMessages([...messages, payload.new]);
        }
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          console.log("subscribed to insert");
        }
      });
    return () => {
      console.log("Removing connection to channel");
      supabaseClient.removeChannel(newMessagesChannel);
    };
  }, [messages]);

  return (
    <div className={styles.messagesContainer}>
      {messages.map((message) => (
        <div key={message.message_id} className={styles.messageContainer}>
          {message.created_at} : {message.message}
        </div>
      ))}
    </div>
  );
};

export default Messages;
