import { DataContext } from "./DataContext";
export const ZOHO = window.ZOHO;
export const DataProvider = ({ children }) => {
  const gettingFields = ({ entity, api_name }) => {
    ZOHO.CRM.META.getFields({ Entity: "Deals" })
      .then(function (data) {
        const fields = data?.fields || [];
        const dealStatusField = fields.find(
          (field) => field?.api_name === "Status",
        );
        const pickListValues =
          dealStatusField?.pick_list_values?.map((item) => item.actual_value) ||
          [];
        // setDealStatusOptions(pickListValues.filter(Boolean));
        return pickListValues.filter(Boolean);
      })
      .catch(function () {
        // setDealStatusOptions([]);
        return [];
      });
  };

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
    gettingFields,
  };

  return (
    <DataContext.Provider value={dataInfo}>{children}</DataContext.Provider>
  );
};
