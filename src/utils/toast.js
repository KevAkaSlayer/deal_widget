import { Bounce, toast } from "react-toastify";

const toastConfig = {
  position: "top-center",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
  transition: Bounce,
};

export const notifySuccess = (message) => {
  toast.success(message, toastConfig);
};

export const notifyError = (message) => {
  toast.error(message, toastConfig);
};
