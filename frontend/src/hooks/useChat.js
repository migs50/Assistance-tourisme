/**
 * useChat.js — Hook gérant l'état complet de la conversation
 */
import { useState, useCallback, useRef } from "react";
import { sendMessage } from "../services/api";
import { v4 as uuid } from "uuid";

export function useChat() {
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const sessionId                 = useRef(uuid());

  const append = useCallback((msg) =>
    setMessages((prev) => [...prev, { id: uuid(), ...msg }]), []);

  const send = useCallback(async (text, language = "fr") => {
    if (!text.trim() || loading) return;

    setError(null);
    append({ role: "user", content: text });
    setLoading(true);

    try {
      const data = await sendMessage(text, sessionId.current, language);
      append({
        role:    "assistant",
        content: data.response,
        agent:   data.agent,
        sources: data.sources ?? [],
      });
    } catch (err) {
      setError("Le serveur est inaccessible. Vérifie que le backend tourne sur le port 8000.");
    } finally {
      setLoading(false);
    }
  }, [loading, append]);

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
    sessionId.current = uuid();
  }, []);

  return { messages, loading, error, send, clear };
}