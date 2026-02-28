import { useContext, useEffect, useState } from "react";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DataContext } from "./contexts/DataContext";
import DealUpdateForm from "./components/DealUpdateForm";
import RelatedQuotesTable from "./components/RelatedQuotesTable";
import { ZOHO } from "./contexts/DataProvider";
import {
  getAllRecords,
  getFieldPicklistValues,
  getRecord,
  resizeWidget,
} from "./services/zohoApi";

function App() {
  const dataContext = useContext(DataContext);
  const closeWindow = dataContext?.closeWindow;
  const closeWindowReload = dataContext?.closeWindowReload;
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [entity, setEntity] = useState("");
  const [entityId, setEntityId] = useState("");
  const [recordData, setRecordData] = useState([]);
  const [accountOptions, setAccountOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [dealStatusOptions, setDealStatusOptions] = useState([]);
  const [quoteStageOptions, setQuoteStageOptions] = useState([]);
  useEffect(() => {
    ZOHO.embeddedApp.on("PageLoad", function (data) {
      console.log(data);
      setEntity(data?.Entity);
      setEntityId(data?.EntityId?.[0]);
      setZohoLoaded(true);
    });
    ZOHO.embeddedApp.init();
  }, []);

  useEffect(() => {
    if (zohoLoaded && entity && entityId) {
      const loadData = async () => {
        resizeWidget().catch(function () {});
        const recordResult = await getRecord(entity, entityId);
        setRecordData(recordResult);
        const accountResult = await getAllRecords("Accounts");
        setAccountOptions(accountResult?.data || []);
        const productResult = await getAllRecords("Products");
        setProductOptions(productResult?.data || []);
        const dealStatusResult = await getFieldPicklistValues(
          "Deals",
          "Status",
        );
        setDealStatusOptions(dealStatusResult || []);
        const quoteStageResult = await getFieldPicklistValues(
          "Quotes",
          "Quote_Stage",
        );
        setQuoteStageOptions(quoteStageResult || []);
      };
      loadData();
    }
  }, [zohoLoaded, entity, entityId]);

  return (
    <>
      {zohoLoaded ? (
        <div className="App border-2 rounded-xl p-3">
          <h1>Deal Widget</h1>
          <section>
            <DealUpdateForm
              recordData={recordData}
              accountOptions={accountOptions}
              dealStatusOptions={dealStatusOptions}
              setRecordData={setRecordData}
              entity={entity}
              entityId={entityId}
            ></DealUpdateForm>
          </section>

          <RelatedQuotesTable
            entity={entity}
            entityId={entityId}
            accountOptions={accountOptions}
            productOptions={productOptions}
            quoteStageOptions={quoteStageOptions}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-outline"
              onClick={closeWindow}
            >
              Cancel
            </button>
            <button
              onClick={closeWindowReload}
              type="submit"
              className="btn btn-neutral"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="App">
          <h1>Loading...</h1>
        </div>
      )}
      <ToastContainer />
    </>
  );
}

export default App;
