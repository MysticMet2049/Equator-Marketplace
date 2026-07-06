import AuthModal from "./AuthModal";
import useRequireAuthAction from "./useRequireAuthAction";

export default function RequireAuthButton({
  children,
  onClick,
  message,
  className = "",
  style = {},
  as: Tag = "button",
  disabled = false,
  ...props
}) {
  const { showModal, setShowModal, handleClick } = useRequireAuthAction({ disabled, onClick });

  return (
    <>
      <Tag className={className} style={style} onClick={handleClick} {...props}>
        {children}
      </Tag>

      {showModal && <AuthModal message={message} onClose={() => setShowModal(false)} />}
    </>
  );
}
