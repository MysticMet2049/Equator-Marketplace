import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAccountPageData } from "../../hooks/useAccountPageData";
import { getProfile } from "./accountUtils";

export default function useAccountPageState() {
  const { user, logout, updateProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const accountData = useAccountPageData({ enabled: isAuthenticated, user });
  const profile = useMemo(() => getProfile(user, accountData.account), [user, accountData.account]);

  const [activeSection, setActiveSection] = useState("profile");
  const [editMode, setEditModeValue] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: profile.name, email: profile.email, phone: profile.phone });

  const setEditMode = (enabled) => {
    if (enabled) {
      setForm({ name: profile.name, email: profile.email, phone: profile.phone });
    }
    setEditModeValue(enabled);
  };

  const handleSave = () => {
    updateProfile(form);
    setEditModeValue(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return {
    user,
    isAuthenticated,
    profile,
    accountInitial: (profile.name || profile.username || "U").charAt(0).toUpperCase(),
    activeSection,
    setActiveSection,
    editMode,
    setEditMode,
    saved,
    form,
    setForm,
    handleSave,
    handleLogout,
    ...accountData,
  };
}
