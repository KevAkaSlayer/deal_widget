import { useEffect, useState } from "react";
import "./App.css";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const ZOHO = window.ZOHO;

function App() {
  const [zohoLoaded, setZohoLoaded] = useState(false);
  const [entity, setEntity] = useState("");
  const [entityId, setEntityId] = useState("");
  const [recordData, setRecordData] = useState([]);
  const [updateStatus, setUpdateStatus] = useState("");
  const [relatedRecord, setRelatedRecord] = useState([]);
  const [accountOptions, setAccountOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [dealStatusOptions, setDealStatusOptions] = useState([]);
  const [quoteStageOptions, setQuoteStageOptions] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [editQuote, setEditQuote] = useState({
    id: "",
    subject: "",
    stage: "",
    total: "",
    accountId: "",
  });

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
      ZOHO.CRM.API.getRecord({ Entity: entity, RecordID: entityId }).then(
        function (data) {
          setRecordData(data || []);
        },
      );
      ZOHO.CRM.UI.Resize({ height: "80%", width: "50%" }).then(function (data) {
        console.log(data);
      });
      ZOHO.CRM.API.getRelatedRecords({
        Entity: entity,
        RecordID: entityId,
        RelatedList: "Quotes",
        page: 1,
        per_page: 10,
      }).then(function (data) {
        setRelatedRecord(data || []);
      });
      ZOHO.CRM.API.getAllRecords({
        Entity: "Accounts",
        page: 1,
        per_page: 200,
      })
        .then(function (data) {
          setAccountOptions(data?.data || []);
        })
        .catch(function () {
          setAccountOptions([]);
        });
      ZOHO.CRM.API.getAllRecords({
        Entity: "Products",
        page: 1,
        per_page: 200,
      })
        .then(function (data) {
          setProductOptions(data?.data || []);
        })
        .catch(function () {
          setProductOptions([]);
        });

      ZOHO.CRM.META.getFields({ Entity: "Deals" })
        .then(function (data) {
          const fields = data?.fields || [];
          const dealStatusField = fields.find(
            (field) => field?.api_name === "Status",
          );
          const pickListValues =
            dealStatusField?.pick_list_values?.map(
              (item) => item.actual_value,
            ) || [];
          setDealStatusOptions(pickListValues.filter(Boolean));
        })
        .catch(function () {
          setDealStatusOptions([]);
        });
      ZOHO.CRM.META.getFields({ Entity: "Quotes" })
        .then(function (data) {
          const fields = data?.fields || [];
          const quoteStageField = fields.find(
            (field) => field?.api_name === "Quote_Stage",
          );
          const picklistValues =
            quoteStageField?.pick_list_values?.map(
              (item) => item?.actual_value,
            ) || [];
          setQuoteStageOptions(picklistValues.filter(Boolean));
        })
        .catch(function () {
          setQuoteStageOptions([]);
        });
    }
  }, [zohoLoaded, entity, entityId]);

  console.log(relatedRecord);

  const deal_name = recordData?.data?.[0]?.Deal_Name;
  const account_name = recordData?.data?.[0]?.Account_Name?.name;
  const account_id = recordData?.data?.[0]?.Account_Name?.id;
  const email = recordData?.data?.[0]?.Email;
  const Status = recordData?.data?.[0]?.Status;
  const amount = recordData?.data?.[0]?.Amount;
  const website = recordData?.data?.[0]?.Website;
  const closeWindow = () => {
    if (ZOHO?.CRM?.UI?.Popup?.closeReload) {
      ZOHO.CRM.UI.Popup.closeReload();
      return;
    }
    if (ZOHO?.CRM?.UI?.Popup?.close) {
      ZOHO.CRM.UI.Popup.close();
      return;
    }
    window.close();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUpdateStatus("Updating...");
    const updated_deal_name = e.target.deal_name.value;
    const updated_account_id = e.target.account_name.value;
    const updated_email = e.target.email.value;
    const updated_amount = e.target.amount.value;
    const updated_status = e.target.status.value;
    const updated_website = e.target.website.value;
    const config = {
      Entity: entity,
      APIData: {
        id: entityId,
        Deal_Name: updated_deal_name,
        Account_Name: { id: updated_account_id },
        Email: updated_email,
        Amount: updated_amount,
        Status: updated_status,
        Website: updated_website,
      },
      Trigger: [],
    };
    ZOHO.CRM.API.updateRecord(config)
      .then(function (data) {
        console.log("Update response:", data);
        if (data?.data?.[0]?.code === "SUCCESS") {
          setUpdateStatus("Record updated successfully!");
          toast.success("Successfully Updated", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
          ZOHO.CRM.API.getRecord({ Entity: entity, RecordID: entityId }).then(
            function (refreshedData) {
              setRecordData(refreshedData);
              setTimeout(() => setUpdateStatus(""), 2000);
              setTimeout(() => closeWindow(), 2000);
            },
          );
        } else {
          setUpdateStatus("Update failed. Please try again.");
          toast.error("Error", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
          setTimeout(() => setUpdateStatus(""), 2000);
        }
      })
      .catch(function (error) {
        console.error("Update error:", error);
        setUpdateStatus("Error updating record.");
        toast.error("Error", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        setTimeout(() => setUpdateStatus(""), 2000);
      });
  };
  const refreshRelatedQuotes = () => {
    return ZOHO.CRM.API.getRelatedRecords({
      Entity: entity,
      RecordID: entityId,
      RelatedList: "Quotes",
      page: 1,
      per_page: 10,
    }).then(function (data) {
      setRelatedRecord(data);
    });
  };

  const createQuote = () => {
    setIsCreateModalOpen(true);
  };
  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateQuote = async (e) => {
    e.preventDefault();
    const quote_name = e.target.subject.value;
    const quote_stage = e.target.stage.value;
    const account_id = e.target.accountId.value;
    const product_id = e.target.product_id.value;
    const quantity = e.target.qunatity.value;
    console.log(quantity, quote_name, quote_stage, account_id, product_id);
    var quoteData = {
      Subject: quote_name,
      Deal_Name: { id: entityId },
      Quote_Stage: quote_stage,
      Account_Name: { id: account_id },
      Product_Details: [
        {
          product: { id: product_id },
          quantity: parseInt(quantity),
        },
      ],
    };
    try {
      const created_quote = await ZOHO.CRM.API.insertRecord({
        Entity: "Quotes",
        APIData: quoteData,
        Trigger: [],
      });
      console.log(created_quote);
      if (created_quote?.data?.[0]?.code === "SUCCESS") {
        toast.success("Quote created successfully", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        await refreshRelatedQuotes();
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to create quote", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
    closeCreateModal();
  };

  const handleEdit = (id) => {
    const selectedQuote = relatedRecord?.data?.find(
      (record) => record?.id === id,
    );
    if (!selectedQuote) {
      toast.error("Unable to load quote details", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

    setEditQuote({
      id: selectedQuote?.id || "",
      subject: selectedQuote?.Subject || "",
      stage: selectedQuote?.Quote_Stage || "",
      total: selectedQuote?.Grand_Total || "",
      accountId: selectedQuote?.Account_Name?.id || "",
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setIsSavingQuote(false);
    setEditQuote({
      id: "",
      subject: "",
      stage: "",
      total: "",
      accountId: "",
    });
  };

  const handleEditQuoteChange = (event) => {
    const { name, value } = event.target;
    setEditQuote((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuoteUpdate = async (event) => {
    event.preventDefault();

    if (!editQuote?.id) {
      toast.error("Unable to update quote", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      return;
    }
    setIsSavingQuote(true);
    try {
      const apiData = {
        id: editQuote.id,
        Subject: editQuote.subject,
        Quote_Stage: editQuote.stage,
        Grand_Total: editQuote.total,
      };

      if (editQuote.accountId) {
        apiData.Account_Name = { id: editQuote.accountId };
      }

      const updateResponse = await ZOHO.CRM.API.updateRecord({
        Entity: "Quotes",
        APIData: apiData,
        Trigger: [],
      });
      if (updateResponse?.data?.[0]?.code !== "SUCCESS") {
        throw new Error("Quote update failed");
      }
      await refreshRelatedQuotes();
      toast.success("Quote updated successfully", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      closeEditModal();
    } catch (error) {
      console.error("Quote update error:", error);
      toast.error("Failed to update quote", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      setIsSavingQuote(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id || !entity || !entityId) {
      toast.error("Unable to delete quote. Missing record details.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      return;
    }
    try {
      const deleteResponse = await ZOHO.CRM.API.deleteRecord({
        Entity: "Quotes",
        RecordID: id,
      });

      if (deleteResponse?.data?.[0]?.code !== "SUCCESS") {
        throw new Error("Delete failed");
      }
      await refreshRelatedQuotes();
      toast.success("Successfully Deleted Quote", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete quote", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };
  return (
    <>
      {zohoLoaded ? (
        <div className="App border-2 rounded-xl p-4">
          <h1>Deal Widget</h1>
          {updateStatus && (
            <div
              className={`alert ${updateStatus.includes("success") ? "" : updateStatus.includes("Error") || updateStatus.includes("failed") ? "" : "alert-info"} mb-4`}
            >
              {updateStatus}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <h2 className="flex mx-2">Deal Details Section</h2>
            <div className="flex gap-2 justify-around p-4 m-2 border-2 rounded-xl">
              <div className="flex flex-col gap-2 m-y-2">
                <label className="label">Deal Name</label>
                <input
                  className="input"
                  type="text"
                  name="deal_name"
                  defaultValue={deal_name}
                />
                <label className="label text-left">Account Name</label>
                <select className="select select-bordered" name="account_name">
                  <option value={account_id}>{account_name}</option>
                  {accountOptions?.map((account) => (
                    <option key={account?.id} value={account?.id}>
                      {account?.Account_Name}
                    </option>
                  ))}
                </select>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="text"
                  name="email"
                  defaultValue={email}
                />
              </div>
              <div className="flex flex-col gap-2 m-y-2">
                <label className="label">Amount</label>
                <input
                  className="input"
                  type="text"
                  name="amount"
                  defaultValue={amount}
                />
                <label className="label text-left">Status</label>
                <select className="select select-bordered" name="status">
                  <option value="">{Status}</option>
                  {dealStatusOptions?.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption}
                    </option>
                  ))}
                </select>
                <label className="label">Website</label>
                <input
                  className="input"
                  name="website"
                  type="text"
                  defaultValue={website}
                />
              </div>
            </div>
            <button className="btn btn-neutral flex m-2" type="submit">
              Update
            </button>
          </form>
          <div className="flex justify-between m-2">
            <h2>Related Quotes</h2>
            <button
              type="button"
              onClick={createQuote}
              className="btn btn-neutral"
            >
              Create Quotes
            </button>
          </div>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Quote Name</TableCell>
                  <TableCell align="right">Account Name</TableCell>
                  <TableCell align="right">Stage</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {relatedRecord?.data?.map((record) => (
                  <TableRow
                    key={record?.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {record?.Subject}
                    </TableCell>
                    <TableCell align="right">
                      {record?.Account_Name?.name}
                    </TableCell>
                    <TableCell align="right">{record?.Quote_Stage}</TableCell>
                    <TableCell align="right">{record?.Grand_Total}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(record?.id)}
                          className="btn btn-sm"
                        >
                          <ModeEditIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(record?.id)}
                          className="btn btn-sm"
                        >
                          <DeleteForeverIcon />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {isEditModalOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 px-4">
              <div className="w-full max-w-xl rounded-xl border bg-black p-4">
                <h3 className="mb-4 text-left text-lg font-semibold">
                  Edit Quote
                </h3>
                <form
                  onSubmit={handleQuoteUpdate}
                  className="flex flex-col gap-3"
                >
                  <label className="label text-left">Quote Name</label>
                  <input
                    className="input"
                    type="text"
                    name="subject"
                    value={editQuote.subject}
                    onChange={handleEditQuoteChange}
                    required
                  />

                  <label className="label text-left">Quote Stage</label>
                  <select
                    className="select select-bordered"
                    name="stage"
                    value={editQuote.stage}
                    onChange={handleEditQuoteChange}
                  >
                    <option value="">Select stage</option>
                    {quoteStageOptions?.map((stageOption) => (
                      <option key={stageOption} value={stageOption}>
                        {stageOption}
                      </option>
                    ))}
                  </select>

                  <label className="label text-left">Grand Total</label>
                  <input
                    className="input"
                    type="number"
                    readOnly
                    name="total"
                    value={editQuote.total}
                    onChange={handleEditQuoteChange}
                  />

                  <label className="label text-left">Account Name</label>
                  <select
                    className="select select-bordered"
                    name="accountId"
                    value={editQuote.accountId}
                    onChange={handleEditQuoteChange}
                  >
                    <option value="">Select account</option>
                    {accountOptions?.map((account) => (
                      <option key={account?.id} value={account?.id}>
                        {account?.Account_Name}
                      </option>
                    ))}
                  </select>

                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={closeEditModal}
                      disabled={isSavingQuote}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-neutral"
                      disabled={isSavingQuote}
                    >
                      {isSavingQuote ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
          {isCreateModalOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 px-4">
              <div className="w-full max-w-xl rounded-xl border bg-black p-4">
                <h3 className="mb-4 text-left text-lg font-semibold">
                  Create Quote
                </h3>
                <form
                  onSubmit={handleCreateQuote}
                  className="flex flex-col gap-3"
                >
                  <label className="label text-left">Quote Name</label>
                  <input
                    className="input"
                    type="text"
                    name="subject"
                    placeholder="Quote Name"
                    required
                  />

                  <label className="label text-left ">Quote Stage</label>
                  <select className="select select-bordered" name="stage">
                    <option value="">Select stage</option>
                    {quoteStageOptions?.map((stageOption) => (
                      <option key={stageOption} value={stageOption}>
                        {stageOption}
                      </option>
                    ))}
                  </select>
                  <label className="label text-left">Account Name</label>
                  <select
                    className="select select-bordered"
                    name="accountId"
                    required
                  >
                    <option value="">Select account</option>
                    {accountOptions?.map((account) => (
                      <option key={account?.id} value={account?.id}>
                        {account?.Account_Name}
                      </option>
                    ))}
                  </select>
                  <div className="flex">
                    <label className="label text-left mx-1">Product Name</label>
                    <select
                      className="select select-bordered"
                      name="product_id"
                      required
                    >
                      <option value="">Select product</option>
                      {productOptions?.map((product) => (
                        <option key={product?.id} value={product?.id}>
                          {product?.Product_Name}
                        </option>
                      ))}
                    </select>
                    <label className="label text-left mx-2">Quantity</label>
                    <input
                      className="input"
                      type="number"
                      step="1"
                      name="qunatity"
                      defaultValue={1}
                    />
                  </div>

                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={closeCreateModal}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-neutral">
                      create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
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
