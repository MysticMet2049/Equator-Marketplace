import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function useRequireAuthAction({ disabled, onClick }) {
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleClick = (event) => {
    if (disabled) return;

    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }

    onClick?.(event);
  };

  return { showModal, setShowModal, handleClick };
}
