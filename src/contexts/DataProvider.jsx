import { DataContext } from "./DataContext";
export const ZOHO = window.ZOHO;
export const DataProvider = ({ children }) => {
  const closeWindow = () => {
    ZOHO.CRM.UI.Popup.close().then(function (data) {
      console.log(data);
    });
  };

  const closeWindowReload = () => {
    ZOHO.CRM.UI.Popup.closeReload().then(function (data) {
      console.log(data);
    });
  };

  const dataInfo = {
    closeWindow,
    closeWindowReload,
  };

  return (
    <DataContext.Provider value={dataInfo}>{children}</DataContext.Provider>
  );
};
